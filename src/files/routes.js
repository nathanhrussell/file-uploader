const express = require("express");
const upload = require("../middlewares/upload");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const path = require("path");

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

router.get("/files/:id", async (req, res) => {
    if (!req.isAuthenticated) {
        return res.status(40).json({ error: "Not authenticated" });
    }

    const fileId = parseInt(req.params.id);


    const file = await prisma.file.findFirst({
        where: {
        id: fileId,
        userId: req.user.id
        },
        include: {
        folder: true
        }
    });

    if (!file) {
        return res.status(404).json({ error: "File not found or not yours."});
    }

    res.json({
        id: file.id,
        name: file.name,
        size: file.size,
        uploadTime: file.uploadTime,
        folder: file.folder
            ? { id: file.folder.id, name: file.folder.name }
            : null
    });
});

router.get("/files/:id/download", async (req, res) => {
    if (!req.isAuthenticated) {
        return res.status(40).json({ error: "Not authenticated" });
    }

    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findFirst({
        where: {
        id: fileId,
        userId: req.user.id
        },
    });

    if (!file) {
        return res.status(404).json({ error: "File not found or not yours."});
    }

    const filePath = path.resolve(file.path);

    res.download(filePath, file.name, (err) => {
        if (err) {
            console.error("Download failed:", err);
            res.status(500).json({ error: "Failed to download file" });
        }
    });
});

module.exports = router;