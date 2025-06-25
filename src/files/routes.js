const express = require("express");
const upload = require("../middlewares/upload");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated) {
        return res.status(40).json({ error: "Not authenticated" });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const { filename, size, path } = req.file;

    try {
        const file = await prisma.file.create({
            data: {
                name: filename,
                size: size,
                path: path,
                use: { connect: { id: req.user.id } }
            }
    });

    res.status(201).json({
        message:"File uploaded",
        file: {
            id: file.id,
            name: file.name,
            size: file.size,
            uploadTime: file.uploadTime
        }
    });

    } catch (error) {
        console.error("Error saving file to DB:", error);
        res.status(500).json({ error: "Failed to save file" });
    }
});

module.exports = router;