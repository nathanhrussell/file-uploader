const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

    fs.unlinkSync(req.file.path); // optional: remove temp file

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        path: result.secure_url,
        url: result.secure_url,
        user: { connect: { id: req.user.id } },
        folderId: folderId
      }
    });

    res.json({ message: "File uploaded", file });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;


module.exports = router;


router.get("/folders", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated"});
    }

    const folders = await prisma.folder.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc"}
    });

    res.json(folders);
});


router.post("/folders", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated"});
    }

    const { name } = req.body;

    const folder = await prisma.folder.create({
        data: {
            name,
            user: { connect: { id: req.user.id } }
        }
    });

    res.status(201).json(folder);
});

router.put("/folders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated"});
    }

    const folderId = parseInt(req.params.id);
    const { name } = req.body;

    const folder = await prisma.folder.updateMany({
        where: {
        id: folderId,
        userId: req.user.id
        },
        data: { name }
    });

    if (folder.count === 0 ) {
        return res.status(404).json({ error: "Folder not found or not yours" });
    }

    res.json({ message: "Folder renamed" });
});

router.delete("/folders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated"});
    }

    const folderId = parseInt(req.params.id);

    try {
        await prisma.folder.delete({
            where: {
                id: folderId,
                userId: req.user.id
            }
        });

        res.json({ message: "Folder deleted" });
    } catch (error) {
        res.status(404).json({ error: "Folder not found or not yours" });
    }
});

router.get("/folders/:id/files", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated"});
    }

    const folderId = parseInt(req.params.id);

    const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: req.user.id }
    });

    if (!folder) {
        return res.status(404).json({ error: "Folder not found or not yours"});
    }

    const files = await prisma.file.findMany({
        where: {
            folderId: folderId,
            userId: req.user.id
        },
        orderBy: { uploadTime: "desc" }
    });

    res.json(files);
});

module.exports = router;