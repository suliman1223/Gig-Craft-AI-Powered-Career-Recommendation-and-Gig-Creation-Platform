const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const Resume = require("../models/Resume");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/api/parse-resume";

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume",
            });
        }

        const resume = await Resume.create({
            user: req.user._id,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            status: "processing",
        });

        let extractedSkills = [];
        let aiMessage = "";
        let parsedData = {};

        try {
            const form = new FormData();
            form.append("file", fs.createReadStream(req.file.path), {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            const aiResponse = await axios.post(AI_SERVICE_URL, form, {
                headers: form.getHeaders(),
                timeout: 60000,
            });

            parsedData = aiResponse?.data || {};
            extractedSkills = aiResponse?.data?.skills || [];
            aiMessage = aiResponse?.data?.status === "success"
                ? "Resume parsed successfully"
                : "Resume uploaded, but skill extraction returned no skills";
        } catch (aiError) {
            console.error("AI parsing failed", aiError.message);
            aiMessage = "Resume uploaded, but AI skill extraction failed";
        }

        const updatedResume = await Resume.findByIdAndUpdate(
            resume._id,
            {
                status: extractedSkills.length > 0 || parsedData.summary || parsedData.education?.length || parsedData.experience?.length || parsedData.projects?.length || parsedData.certifications?.length || parsedData.languages?.length ? "completed" : "failed",
                summary: parsedData.summary || parsedData.normalized_text || "",
                skills: Array.isArray(parsedData.skills) ? parsedData.skills : extractedSkills,
                education: Array.isArray(parsedData.education) ? parsedData.education : [],
                experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
                projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
                certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
                languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
            },
            { new: true }
        );

        res.status(201).json({
            success: true,
            message: "Resume uploaded successfully",
            aiMessage,
            skills: extractedSkills,
            resume: updatedResume,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

    const extractResume = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload a resume",
                });
            }

            let parsedData = {};

            try {
                const form = new FormData();
                form.append("file", fs.createReadStream(req.file.path), {
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                });

                const aiResponse = await axios.post(AI_SERVICE_URL, form, {
                    headers: form.getHeaders(),
                    timeout: 60000,
                });

                parsedData = aiResponse?.data || {};
                // If AI returned an error-shaped response, forward it
                if (parsedData?.status === "error") {
                    console.error("AI service returned error:", parsedData?.message || parsedData);
                    return res.status(502).json({
                        success: false,
                        message: "AI parsing service error",
                        details: parsedData?.message || parsedData,
                    });
                }
            } catch (aiError) {
                console.error("AI parsing failed", aiError?.message || aiError);
                // If axios got a response from AI with details, forward them
                if (aiError?.response?.data) {
                    return res.status(aiError.response.status || 502).json({
                        success: false,
                        message: "AI parsing failed",
                        details: aiError.response.data,
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: "AI parsing failed",
                    details: aiError?.message || String(aiError),
                });
            }

            // Normalize parsed data to only include the fields the UI expects.
            const normalized = {
                summary: parsedData.summary || parsedData.normalized_text || "",
                skills: Array.isArray(parsedData.skills) ? Array.from(new Set(parsedData.skills)) : [],
                education: Array.isArray(parsedData.education) ? parsedData.education : [],
                experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
                projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
                certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
                languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
            };

            return res.status(200).json({
                success: true,
                parsed: normalized,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server Error",
            });
        }
    };

    module.exports = {
        uploadResume,
        extractResume,
    };