const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const upload = require('../middleware/uploadMiddleware'); 
const Resume = require('../models/resume'); 

// 1. Handles the Upload endpoint (${API_URL}/resume/upload)
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
        console.error('Upload route error:', error.message);
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// 2. Handles the Extract endpoint (${API_URL}/resume/extract)
router.post('/extract', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = `uploads/${req.file.filename}`;
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const fastApiResponse = await axios.post('http://127.0.0.1:8000/parse_resume', formData, {
            headers: { ...formData.getHeaders() },
        });

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
            certifications: data.certificates || [],
            languages: data.languages || []
        };

        const updatedDoc = await Resume.findOneAndUpdate(
            { user: targetUserId, status: 'uploaded' },
            { $set: updatedFields },
            { new: true, sort: { createdAt: -1 } }
        );

        if (!updatedDoc) {
            const newDoc = await Resume.create({
                user: targetUserId,
                originalName: req.file.originalname,
                fileName: req.file.filename,
                filePath: req.file.path || filePath,
                fileSize: req.file.size,
                fileType: req.file.mimetype,
                ...updatedFields
            });
            return res.status(200).json(newDoc);
        }

        return res.status(200).json(updatedDoc);

    } catch (error) {
        console.error('AI parsing failed:', error.message);
        return res.status(500).json({ message: 'Extraction failed', error: error.message });
    }
});

module.exports = router;