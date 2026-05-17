const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { pinFile, getFileUrl } = require("../utils/pinata");
const auth = require("../middleware/auth");

// Only admins can upload to IPFS
router.post("/", auth, upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const result = await pinFile(req.file.buffer, req.file.originalname);
        const url = getFileUrl(result.ipfsCID);

        res.json({
            ...result,
            ipfsUrl: url
        });
    } catch (error) {
        console.error("IPFS Pinning Error:", error);
        res.status(500).json({ 
            error: "IPFS upload failed",
            details: error.response?.data?.error || error.message
        });
    }
});

module.exports = router;
