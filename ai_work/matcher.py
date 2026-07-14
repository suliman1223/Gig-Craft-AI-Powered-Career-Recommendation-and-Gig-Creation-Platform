import os
import time
import threading
from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors
from dotenv import load_dotenv
from pymongo import MongoClient  # Clean MongoDB client connection driver

load_dotenv()

# Define the router connection link
router = APIRouter()

print("🧠 Loading Sentence-Transformer model into system cache...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# ==============================================================================
# 🛠️ GOOGLE SHEET INTEGRATION CONFIGURATION
# ==============================================================================
# FALLBACK: If your .env file is failing to load, paste your exact sheet ID below:
HARDCODED_SHEET_ID = "1aCCYjy4DiISF1rp3IYDXg7bKPRx-yTgXKI7TN0ILsPk"

raw_sheet_id = os.getenv("GOOGLE_SHEET_ID", "").strip()
if not raw_sheet_id or raw_sheet_id == "":
    raw_sheet_id = HARDCODED_SHEET_ID

# Safely extract the alphanumeric ID if the entire browser URL was accidentally pasted
if "docs.google.com" in raw_sheet_id:
    parts = raw_sheet_id.split("/d/")
    if len(parts) > 1:
        sheet_id = parts[1].split("/")[0]
    else:
        sheet_id = raw_sheet_id
else:
    sheet_id = raw_sheet_id

sheet_range = os.getenv("GOOGLE_SHEET_RANGE", "").strip()

# Construct verified export target endpoint
if not sheet_id or sheet_id == "PASTE_YOUR_ACTUAL_SHEET_ID_HERE":
    print("❌ CRITICAL SYSTEM ERROR: Google Sheet ID is blank! Please populate HARDCODED_SHEET_ID.")
    sheet_url = ""
else:
    sheet_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    if sheet_range:
        sheet_url += f"&gid={sheet_range}"

print(f"🔗 Target Data Link Formatted: {sheet_url}")
# ==============================================================================

GLOBAL_CACHE = {
    "df": None,
    "X_train": None,
    "last_updated": 0,
    "title_col": "",
    "desc_col": "",
    "company_col": None,
    "location_col": None,
    "link_col": None,
    "exp_col": None
}
CACHE_LOCK = threading.Lock()
CACHE_TTL_SECONDS = 300 

class ResumePayload(BaseModel):
    skills: List[Any] = []
    education: List[str] = []
    experience: List[str] = []
    projects: List[str] = []
    certifications: List[str] = []
    summary: str = ""

def refresh_jobs_cache_if_needed(force: bool = False):
    current_time = time.time()
    if not force and GLOBAL_CACHE["df"] is not None and (current_time - GLOBAL_CACHE["last_updated"] < CACHE_TTL_SECONDS):
        return

    with CACHE_LOCK:
        if not force and GLOBAL_CACHE["df"] is not None and (current_time - GLOBAL_CACHE["last_updated"] < CACHE_TTL_SECONDS):
            return

        try:
            if not sheet_url:
                raise ValueError("Cannot pull data because sheet_url configuration is broken or missing.")
                
            print(f"🔄 Pulling active vacancies from Google Sheets pipeline...")
            df = pd.read_csv(sheet_url)
            
            # Clean trailing spaces from column names
            df.columns = [c.strip() for c in df.columns]
            
            if len(df) == 0:
                print("⚠️ Google Sheet data source is currently empty.")
                return

            # --- HARDCODED TO YOUR EXACT 16-COLUMN SCHEMA ---
            title_col = "title"
            desc_col = "description"
            company_col = "companyName"
            location_col = "location"
            
            # Prioritize jobUrl, fallback to applyUrl if jobUrl isn't populated
            link_col = "jobUrl" if "jobUrl" in df.columns else "applyUrl"

            # Double check to ensure these core columns actually exist in the fetched sheet
            for col in [title_col, desc_col, company_col, location_col]:
                if col not in df.columns:
                    raise KeyError(f"❌ Missing expected column '{col}' in your Google Sheet! Please verify spelling.")

            # Fill empty cell values safely to avoid breaking string parsing
            df[title_col] = df[title_col].fillna("Job Opportunity").astype(str)
            df[desc_col] = df[desc_col].fillna("").astype(str)
            df[company_col] = df[company_col].fillna("Tech Company").astype(str)
            df[location_col] = df[location_col].fillna("Remote/Unspecified").astype(str)

            training_features = []
            for idx in range(len(df)):
                # Combining title, description, workType, and experienceLevel for a strong BERT match
                work_type = str(df["workType"].iloc[idx]) if "workType" in df.columns and pd.notna(df["workType"].iloc[idx]) else ""
                exp_level = str(df["experienceLevel"].iloc[idx]) if "experienceLevel" in df.columns and pd.notna(df["experienceLevel"].iloc[idx]) else ""
                
                combined_job_text = (
                    f"Title: {df[title_col].iloc[idx]} | "
                    f"Company: {df[company_col].iloc[idx]} | "
                    f"Location: {df[location_col].iloc[idx]} | "
                    f"Type: {work_type} | "
                    f"Experience Level: {exp_level} | "
                    f"Description: {df[desc_col].iloc[idx]}"
                )
                training_features.append(combined_job_text)

            print("🧠 Compiling matrix map using BERT embeddings...")
            X_train = model.encode(training_features, show_progress_bar=False)

            GLOBAL_CACHE.update({
                "df": df, "X_train": X_train, "title_col": title_col, "desc_col": desc_col,
                "company_col": company_col, "location_col": location_col, "link_col": link_col,
                "exp_col": None, "last_updated": current_time
            })
            print("✅ Memory Cache successfully updated using your exact 16-column layout keys.")
        except Exception as e:
            print("❌ Sheet Synchronization Failure:", str(e))
            raise e

def get_job_recommendations(user_data: Dict[str, Any], top_k: int = 5) -> List[dict]:
    try:
        refresh_jobs_cache_if_needed()
        df = GLOBAL_CACHE["df"]
        X_train = GLOBAL_CACHE["X_train"]

        if df is None or len(df) == 0:
            print("⚠️ Matcher warning: Job DataFrame is empty or not loaded.")
            return []

        # --- EXTRACT FROM MONGO SCHEMA SAFELY ---
        summary_text = str(user_data.get("summary", "")).strip()
        
        # Parse skills (handles both flat list of strings or list of dicts)
        skills_input = user_data.get("skills", [])
        if isinstance(skills_input, list):
            skills_text = ", ".join([str(s.get("name", s)) if isinstance(s, dict) else str(s) for s in skills_input]).strip()
        else:
            skills_text = str(skills_input).strip()
        
        # Parse education & experience lists safely
        edu_list = user_data.get("education", [])
        edu_text = " ".join([str(e) for e in edu_list]).strip() if isinstance(edu_list, list) else str(edu_list).strip()
        
        exp_list = user_data.get("experience", [])
        exp_text = " ".join([str(e) for e in exp_list]).strip() if isinstance(exp_list, list) else str(exp_list).strip()
        
        # Parse certifications list safely
        cert_list = user_data.get("certifications", user_data.get("certificates", []))
        cert_text = " ".join([str(c) for c in cert_list]).strip() if isinstance(cert_list, list) else str(cert_list).strip()

        # Build a robust user profile string combining all MongoDB profile vectors
        user_profile_text = f"Summary: {summary_text} | Skills: {skills_text} | Experience: {exp_text} | Education: {edu_text} | Certifications: {cert_text}"
        
        print(f"🧠 Encoding CV Vector string snippet: {user_profile_text[:120]}...")
        user_vector = model.encode([user_profile_text])

        k_val = min(top_k, len(df))
        if k_val == 0:
            return []

        knn_model = NearestNeighbors(n_neighbors=k_val, metric="cosine")
        knn_model.fit(X_train)
        distances, indices = knn_model.kneighbors(user_vector)

        matched_list = []
        title_col = GLOBAL_CACHE["title_col"]
        desc_col = GLOBAL_CACHE["desc_col"]
        company_col = GLOBAL_CACHE["company_col"]
        location_col = GLOBAL_CACHE["location_col"]
        link_col = GLOBAL_CACHE["link_col"]

        for rank, idx in enumerate(indices[0]):
            row = df.iloc[idx]
            cosine_distance = float(distances[0][rank])
            cosine_similarity_score = 1.0 - cosine_distance
            
            # Convert to a meaningful percentage display
            match_percentage = int(max(0.0, min(1.0, cosine_similarity_score)) * 100)

            preview_skills = [s.strip() for s in str(row[desc_col]).split(",") if s.strip()][:4]
            if len(preview_skills) == 1 and " " in preview_skills[0]:
                preview_skills = preview_skills[0].split()[:4]

            matched_list.append({
                "job_title": str(row[title_col]),
                "company": str(row[company_col]) if company_col and pd.notna(row[company_col]) else "Tech Company",
                "location": str(row[location_col]) if location_col and pd.notna(row[location_col]) else "Remote",
                "match_percentage": match_percentage,
                "matched_skills": preview_skills,
                "job_link": str(row[link_col]) if link_col and pd.notna(row[link_col]) else "https://www.linkedin.com"
            })

        return sorted(matched_list, key=lambda x: x["match_percentage"], reverse=True)
    except Exception as e:
        print("❌ Matching Engine Execution Error:", str(e))
        raise e

@router.post("/match_jobs_engine")
def match_jobs_engine(payload: Dict[str, Any] = None):
    # Fallback to empty dict if nothing sent via payload wrapper parameters
    user_profile = payload or {}

    # 1. Active MongoDB query sequence logic if frontend data vector is blank
    if not user_profile or not user_profile.get("skills"):
        print("🔍 Frontend layout parameter block payload empty. Extracting straight from MongoDB pipeline...")
        try:
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
            client = MongoClient(mongo_uri)
            
            # Double-check that these match your database & collection configuration names exactly!
            db = client["cv_parser_db"] 
            collection = db["resumes"]
            
            # Safely extract the single most recently compiled CV entry
            latest_cv = collection.find_one(sort=[("_id", -1)])
            if latest_cv:
                user_profile = latest_cv
                print("✅ Successfully pulled the active CV profile text variables straight from MongoDB!")
            else:
                print("⚠️ MongoDB connection successfully set, but target parsing collection returns empty.")
        except Exception as mongo_err:
            print(f"❌ Unhandled connection exception during MongoDB query setup: {str(mongo_err)}")

    # 2. Compute recommendations using our explicit composite text blocks
    recommendations = get_job_recommendations(user_profile, top_k=5)
    print(f"🎉 Sending back {len(recommendations)} matches directly to the web client engine map.")
    
    return {"job_matching_engine_results": recommendations}