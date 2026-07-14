const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const upload = require('../middleware/uploadMiddleware'); 
const Resume = require('../models/resume'); 

// --- FIXED: PIPELINE RECOMMENDATION LOGIC ---
router.post('/jobs/recommend', async (req, res) => {
    try {
        const targetUserId = req.user?._id || req.user?.id || req.body.userId || "6543210fedcba9876543210f";
        
        const resumeDoc = await Resume.findOne({ user: targetUserId }).sort({ createdAt: -1 });
        
        if (!resumeDoc) {
            return res.status(200).json({ resume: null, recommended_jobs: [] });
        }

        try {
            const parsedSkills = Array.isArray(resumeDoc.skills) 
                ? resumeDoc.skills.map(s => typeof s === 'object' ? (s.name || '') : String(s))
                : [];

            // CHANGED: Added payload mapping for summary to pass structural components down to FastAPI
            const matchResponse = await axios.post('http://127.0.0.1:8001/match_jobs_engine', {
                skills: parsedSkills,
                education: resumeDoc.education || [],
                experience: resumeDoc.experience || [],
                projects: resumeDoc.projects || [],
                certifications: resumeDoc.certifications || [],
                summary: resumeDoc.summary || ""
            });
            
            const engineJobs = matchResponse.data.job_matching_engine_results || [];

            return res.status(200).json({
                resume: resumeDoc,
                recommended_jobs: engineJobs
            });
        } catch (matchError) {
            console.error('FastAPI Engine connection failed:', matchError.message);
            return res.status(200).json({
                resume: resumeDoc,
                recommended_jobs: []
            });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});

router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const targetUserId = req.user?._id || req.user?.id || req.body.userId || "6543210fedcba9876543210f";

        const newResume = new Resume({
            user: targetUserId,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            filePath: req.file.path || `uploads/${req.file.filename}`,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            status: 'uploaded',
            skills: [],
            education: [],
            experience: [],
            projects: [],
            certifications: [],
            languages: []
        });

        await newResume.save();
        return res.status(200).json({ message: 'Resume uploaded successfully!', skills: [] });
    } catch (error) {
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// --- FIXED: EXTRACT PIPELINE LOGIC LOOP ---
router.post('/extract', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        let fastApiResponse;
        try {
            fastApiResponse = await axios.post('http://127.0.0.1:8001/parse_resume', formData, {
                headers: { ...formData.getHeaders() },
            });
        } catch (apiErr) {
            console.error("FastAPI parser down:", apiErr.message);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(500).json({ message: "FastAPI parsing service is offline." });
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const data = fastApiResponse.data;
        const targetUserId = req.user?._id || req.user?.id || req.body.userId || "6543210fedcba9876543210f";

        const updatedFields = {
            status: 'completed',
            summary: data.summary || "",
            skills: data.skills || [],
            education: data.education || [],
            experience: data.experience || [],
            projects: data.projects || [],
            certifications: data.certificates || data.certifications || [],
            languages: data.languages || []
        };

        let updatedDoc = await Resume.findOneAndUpdate(
            { user: targetUserId },
            { $set: updatedFields },
            { returnDocument: 'after', sort: { createdAt: -1 } }
        );

        if (!updatedDoc) {
            updatedDoc = await Resume.create({
                user: targetUserId,
                originalName: req.file.originalname,
                fileName: req.file.filename,
                filePath: req.file.path,
                fileSize: req.file.size,
                fileType: req.file.mimetype,
                ...updatedFields
            });
        }

        // --- DYNAMIC PIPELINE FIX HERE ---
        // Instead of returning an empty array right after parsing, we trigger 
        // the matching engine immediately so the initial upload returns jobs!
        let automaticJobsList = [];
        try {
            const engineResponse = await axios.post('http://127.0.0.1:8001/match_jobs_engine', {
                skills: updatedFields.skills,
                education: updatedFields.education,
                experience: updatedFields.experience,
                projects: updatedFields.projects,
                certifications: updatedFields.certifications,
                summary: updatedFields.summary
            });
            automaticJobsList = engineResponse.data.job_matching_engine_results || [];
        } catch (engineErr) {
            console.error("Automatic recommendation matching downstream failed:", engineErr.message);
        }

        return res.status(200).json({
            resume: updatedDoc,
            recommended_jobs: automaticJobsList // FIXED: Returns the live data array
        });

    } catch (error) {
        console.error('AI parsing failed:', error.message);
        return res.status(500).json({ message: 'Extraction failed', error: error.message });
    }
});

module.exports = router;