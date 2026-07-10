import React, { useState } from "react";
import "../css/UploadCV.css";
import axios from "axios";
import { API_URL } from "../config.js";
import { uploadResume } from "../services/resumeService";

function UploadBox({
  inputId = "cv-upload",
  compact = false,
  showExtractButton = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      alert("Resume uploaded successfully!");

      console.log(result);

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Upload failed"
      );

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
          <button className="extract-btn" disabled={!selectedFile}>
            Extract Skills
          </button>
        )}
      </div>
    </div>
  );
}

export default UploadBox;