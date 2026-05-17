const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const upload = require("../middleware/upload");

router.post("/", upload.single("file"), (req, res) => {
    try {
        let buffer;
        if (req.file) {
            // Case 1: PDF File Upload
            buffer = req.file.buffer;
        } else if (req.body.metadata) {
            // Case 2: JSON Metadata
            // Standardizing JSON stringification for consistent hashing
            const metadataStr = JSON.stringify(req.body.metadata, Object.keys(req.body.metadata).sort());
            buffer = Buffer.from(metadataStr);
        } else {
            return res.status(400).json({ error: "No file or metadata provided" });
        }

        const hash = crypto.createHash("sha256").update(buffer).digest("hex");
        const hashBytes32 = "0x" + hash;

        res.json({ hash, hashBytes32 });
    } catch (error) {
        console.error("Hashing Error:", error);
        res.status(500).json({ error: "Internal server error during hashing" });
    }
});

module.exports = router;
