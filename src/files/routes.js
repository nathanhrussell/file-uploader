const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const folderId = req.body.folderId ? parseInt(req.body.folderId) : null;

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "user_uploads"
    });

    fs.unlinkSync(req.file.path);

    const file = await prisma.file.create({
    data: {
        name: req.file.originalname,
        size: req.file.size,
        path: result.secure_url,
        url: result.secure_url,
        user: {
        connect: {
            id: req.user.id
        }
        },
        folder: folderId
        ? { connect: { id: folderId } }
        : undefined
    }
    });


    res.json({ message: "File uploaded successfully", file });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;


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

router.delete("/files/:id", async (req, res) => {
    if (!req.isAuthenticated) {
        return res.status(40).json({ error: "Not authenticated" });
    }

    try {
        const file = await prisma.file.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!file || file.userId !== req.user.id) {
            return res.status(404).json({ error: "File not found or not yours."});
        }

        await prisma.file.delete({
            where: { id: file.id }
        });

        res.json({ message: "File deleted" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(55).json({ error: "Failed to delete file "});
    }
});

module.exports = router;