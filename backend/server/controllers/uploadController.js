const Resume = require("../models/Resume");

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

            status: "uploaded",
        });

        res.status(201).json({
            success: true,
            message: "Resume uploaded successfully",
            resume,
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
};