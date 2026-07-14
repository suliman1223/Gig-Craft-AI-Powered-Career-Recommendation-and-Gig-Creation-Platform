import React, { useState } from "react";
import "../css/UploadCV.css";
import { uploadResume, extractResume } from "../services/resumeService";

function UploadBox({
  inputId = "cv-upload",
  compact = false,
  showExtractButton = false,
  onExtractSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFile = (file) => {
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setError("Only PDF and DOCX files are allowed.");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const result = await uploadResume(selectedFile);
      setExtractedSkills(result.skills || []);
      alert("Resume uploaded successfully!");
      console.log(result);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const [parsed, setParsed] = useState(null);

  const handleExtract = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const result = await extractResume(selectedFile);
      
      // Fix: Safely read the backend's key structures
      const parsedData = result.resume || result.parsed || result;
      const recommendedJobs = result.recommended_jobs || [];

      setExtractedSkills(parsedData.skills || []);
      setParsed(parsedData);

      if (onExtractSuccess) {
        onExtractSuccess(parsedData, recommendedJobs);
      }

      alert("Resume extracted successfully");
    } catch (err) {
      console.error('Extract error', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Extraction failed";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "upload-box compact" : "upload-box"}>
      <div
        className="drop-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-icon">📄</div>

        <h3>Drag & Drop Your CV Here</h3>
        <p>or choose a file from your computer</p>

        <input
          type="file"
          id={inputId}
          accept=".pdf,.docx"
          onChange={handleChange}
          hidden
        />

        <label htmlFor={inputId} className="choose-file-btn">
          Choose File
        </label>
      </div>

      <div className="file-info">
        <span>Selected File:</span>
        <strong>{selectedFile ? selectedFile.name : "No file selected"}</strong>
      </div>

      {error && <p className="file-error">{error}</p>}

      <div className="upload-actions">
        <button
          className="upload-main-btn"
          disabled={!selectedFile || loading}
          onClick={handleUpload}
        >
          {loading ? "Uploading..." : "Upload CV"}
        </button>

        {showExtractButton && (
          <button className="extract-btn" disabled={!selectedFile || loading} onClick={handleExtract}>
            {loading ? "Extracting..." : "Extract CV"}
          </button>
        )}
      </div>

      {parsed && (
        <div className="parsed-results">
          {parsed.summary && (
            <div className="file-info">
              <span>Summary:</span>
              <div>{parsed.summary}</div>
            </div>
          )}

          {parsed.skills?.length > 0 && (
            <div className="file-info">
              <span>Skills:</span>
              <strong>{parsed.skills.join(", ")}</strong>
            </div>
          )}

          {parsed.education?.length > 0 && (
            <div className="file-info">
              <span>Education:</span>
              <ul>{parsed.education.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          {parsed.experience?.length > 0 && (
            <div className="file-info">
              <span>Experience:</span>
              <ul>{parsed.experience.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          {parsed.projects?.length > 0 && (
            <div className="file-info">
              <span>Projects:</span>
              <ul>{parsed.projects.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}

          {parsed.certifications?.length > 0 && (
            <div className="file-info">
              <span>Certifications:</span>
              <ul>{parsed.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}

          {parsed.languages?.length > 0 && (
            <div className="file-info">
              <span>Languages:</span>
              <ul>{parsed.languages.map((l, i) => <li key={i}>{l}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadBox;