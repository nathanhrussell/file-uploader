const express = require("express");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
    });
});

module.exports = router;