const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    // User who uploaded the resume
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // File Information
    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    // Resume Processing Status
    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },

    // AI Extracted Data (will be filled later)
    summary: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: Array,
      default: [],
    },

    experience: {
      type: Array,
      default: [],
    },

    projects: {
      type: Array,
      default: [],
    },

    certifications: {
      type: Array,
      default: [],
    },

    languages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const Resume = mongoose.model("Resume", ResumeSchema);

module.exports = Resume;