import React, { useState } from "react";
import "../css/UploadCV.css";

function UploadBox({
  inputId = "cv-upload",
  compact = false,
  showExtractButton = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

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
        <button className="upload-main-btn" disabled={!selectedFile}>
          Upload CV
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