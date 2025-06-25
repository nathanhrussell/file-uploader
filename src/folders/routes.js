const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

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