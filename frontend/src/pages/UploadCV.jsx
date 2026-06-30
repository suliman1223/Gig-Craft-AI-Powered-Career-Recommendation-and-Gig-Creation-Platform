import React from "react";
import "../css/UploadCV.css";
import UploadBox from "../components/UploadBox";
import { useNavigate } from "react-router-dom";

function UploadCV() {
  const navigate = useNavigate();

  return (
    <section className="upload-page">
      <div className="upload-left">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <h1>Upload Your Resume</h1>

        <p>
          Upload your CV and let GigCraft AI extract your skills, education,
          projects and experience for intelligent job matching.
        </p>

        <div className="upload-benefits">
          <div>
            <h3>Smart CV Reading</h3>
            <p>Extracts skills, education and experience from your resume.</p>
          </div>

          <div>
            <h3>AI Skill Detection</h3>
            <p>Finds technical skills like React, Node.js, Python and more.</p>
          </div>

          <div>
            <h3>Job Match Ready</h3>
            <p>Your extracted profile will be used for matching jobs.</p>
          </div>
        </div>
      </div>

      <div className="upload-right">
        <div className="upload-card">
          <h2>CV Upload</h2>
          <p>Supported formats: PDF and DOCX</p>

          <UploadBox inputId="upload-page-cv-upload" showExtractButton />

         
        </div>
      </div>
    </section>
  );
}

export default UploadCV;