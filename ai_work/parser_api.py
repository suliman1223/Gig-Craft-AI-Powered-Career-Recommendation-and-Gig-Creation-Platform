import io
import re
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware  # 1. Import CORS framework
from typing import List
import pdfplumber
import docx

# IMPORT the router and the warm-up function from matcher.py
from matcher import router as matching_router, refresh_jobs_cache_if_needed

app = FastAPI(title="Gig-Craft AI Platform API")

# ==============================================================================
# 🌐 CONFIGURE CORS MIDDLEWARE (Fixes 405 Method Not Allowed / Preflight checks)
# ==============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],             # Allows requests from React, Vue, Next.js, etc.
    allow_credentials=True,
    allow_methods=["*"],             # Explicitly handles OPTIONS, POST, GET, etc.
    allow_headers=["*"],             # Allows standard/custom authentication headers
)

# Connect the matching endpoints directly to this file *after* CORS rules are active
app.include_router(matching_router)


@app.on_event("startup")
def startup_event():
    """Builds google sheet data cache on execution startup."""
    refresh_jobs_cache_if_needed(force=True)


def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()
    text = ""
    file_bytes = file.file.read()
    
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                    
    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        
    file.file.seek(0)
    return text


def parse_resume_text(text: str) -> dict:
    raw_lines = [line.strip() for line in text.split("\n")]
    clean_lines = [l for l in raw_lines if l]
    full_text = "\n".join(clean_lines)
    lower_text = full_text.lower()

    headings = {
        "summary": ["summary", "professional summary", "objective", "profile", "about me"],
        "skills": ["skills", "technical skills", "core competencies", "technologies", "expertise"],
        "experience": ["experience", "work experience", "employment history", "work history"],
        "projects": ["projects", "academic projects", "personal projects"],
        "education": ["education", "academic background", "qualifications"]
    }

    indices = {}
    for section, keywords in headings.items():
        for kw in keywords:
            match = re.search(r'(?:^|\n)' + re.escape(kw) + r'(?:\s*[\:\-\|]|\s*\n)', lower_text)
            if match:
                indices[section] = match.start()
                break

    sorted_sections = sorted(indices.items(), key=lambda x: x[1])
    sections_content = {"summary": "", "skills": "", "experience": "", "projects": "", "education": ""}

    for i in range(len(sorted_sections)):
        current_sec, start_idx = sorted_sections[i]
        end_idx = sorted_sections[i+1][1] if i + 1 < len(sorted_sections) else len(full_text)
        
        chunk = full_text[start_idx:end_idx].strip()
        chunk_lines = chunk.split("\n")
        if chunk_lines:
            sections_content[current_sec] = "\n".join(chunk_lines[1:]).strip()

    skills_block = sections_content["skills"]
    skills_list = []
    if skills_block:
        raw_items = re.split(r'[,\|•\t\n]|\s{2,}', skills_block)
        skills_list = [item.strip() for item in raw_items if item.strip() and len(item.strip()) < 30]

    if not skills_list:
        common_vocab = ["python", "javascript", "html", "css", "react", "node", "express", "mongodb", "sql", "flutter", "dart", "machine learning", "deep learning", "java", "c++", "unity", "c#", "git", "fastapi", "flask"]
        for v in common_vocab:
            if re.search(r'\b' + re.escape(v) + r'\b', lower_text):
                skills_list.append(v.title() if len(v) > 3 else v.upper())

    return {
        "summary": sections_content["summary"] if sections_content["summary"] else full_text[:300],
        "skills": skills_list if skills_list else ["Extracted Profile"],
        "education": [s.strip() for s in sections_content["education"].split("\n") if s.strip()] if sections_content["education"] else ["See CV details"],
        "experience": [s.strip() for s in sections_content["experience"].split("\n") if s.strip()] if sections_content["experience"] else ["See work history"],
        "projects": [s.strip() for s in sections_content["projects"].split("\n") if s.strip()] if sections_content["projects"] else [],
        "certifications": [],
        "languages": ["English"]
    }


@app.post("/parse_resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        raw_text = extract_text_from_file(file)
        return parse_resume_text(raw_text)
    except Exception as e:
        return {"error": f"Extraction failed: {str(e)}"}


