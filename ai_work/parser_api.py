from fastapi import FastAPI, UploadFile, File
import pdfplumber
import docx
import re
import io

app = FastAPI()

def extract_text_from_pdf(file_bytes):
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            val = page.extract_text()
            if val:
                text += val + "\n"
    return text

def extract_text_from_docx(file_bytes):
    doc = docx.Document(io.BytesIO(file_bytes))
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return "\n".join(text)
def parse_resume_content(text):
    parsed_data = {
        "skills": [],
        "education": [],
        "certificates": [],
        "experience": [],
        "projects": []  # Added projects array
    }
    
    lines = text.split("\n")
    current_section = None
    skills_raw_lines = []
    
    for line in lines:
        clean_line = line.strip()
        if not clean_line:
            continue
            
        lower_line = clean_line.lower()
        
        # Detect Section Headings
        if "education" in lower_line or "academic" in lower_line:
            current_section = "education"
            continue
        elif "experience" in lower_line or "work history" in lower_line or "employment" in lower_line:
            current_section = "experience"
            continue
        elif "certification" in lower_line or "certificate" in lower_line or "award" in lower_line:
            current_section = "certificates"
            continue
        elif "project" in lower_line or "personal work" in lower_line:
            current_section = "projects"  # Detect projects section
            continue
        elif "skills" in lower_line or "core competencies" in lower_line or "expertise" in lower_line:
            current_section = "skills"
            continue
        elif any(sec in lower_line for sec in ["summary", "objective", "contact", "languages"]):
            current_section = None
            continue
            
        # Collect content line by line based on active section
        if current_section == "skills":
            skills_raw_lines.append(clean_line)
        elif current_section and len(clean_line) > 3:
            parsed_data[current_section].append(clean_line)
            
    # Process the collected skills chunk dynamically
    all_skills = []
    for raw_line in skills_raw_lines:
        split_skills = re.split(r'[,|•\t]|\s{2,}', raw_line)
        for s in split_skills:
            clean_skill = s.strip().strip("*-•")
            if clean_skill and len(clean_skill.split()) <= 4:
                all_skills.append(clean_skill)
                
    parsed_data["skills"] = list(set(all_skills))
    return parsed_data
@app.post("/parse_resume")
async def parse_resume(file: UploadFile = File(...)):
    file_bytes = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx"):
        raw_text = extract_text_from_docx(file_bytes)
    else:
        return {"error": "Unsupported file format."}
        
    result = parse_resume_content(raw_text)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)