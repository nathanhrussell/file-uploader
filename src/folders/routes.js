const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

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

    res.json({ message: "File uploaded", file });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

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

router.post("/folders/:id/share", async (req, res) => {
  const folderId = parseInt(req.params.id);
  const { days = 1 } = req.body;

  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { user: true }
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const shareToken = uuidv4();
    const sharedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await prisma.folder.update({
        where: { id: folderId },
        data: {
            shareToken,
            sharedUntil
        }
    });

    const shareUrl = `${req.protocol}//${req.get("host")}/share/${shareToken}`;
    res.json({ message: "Share link generated", shareUrl });
} catch (err) {
    console.error("Error generating share link:", err);
    res.status(500).json({ error: "Something went wrong" });
}
});

router.get("/share/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const folder = await prisma.folder.findUnique({
      where: { shareToken: token },
      include: {
        files: true
      }
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found or link invalid" });
    }

    if (folder.sharedUntil && new Date() > folder.sharedUntil) {
      return res.status(410).json({ error: "Link has expired" });
    }

    res.json({
      folder: {
        id: folder.id,
        name: folder.name,
        sharedUntil: folder.sharedUntil,
        files: folder.files.map(file => ({
          id: file.id,
          name: file.name,
          size: file.size,
          uploadTime: file.uploadTime,
          url: file.url
        }))
      }
    });
  } catch (err) {
    console.error("Error accessing shared folder:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;