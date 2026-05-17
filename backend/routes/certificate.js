const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { getContract } = require("../utils/contract");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:7545");

// GET /api/certificate/:certId - Fetch certificate details
router.get("/:certId", async (req, res) => {
    try {
        const contract = getContract(provider);
        const certData = await contract.getCertificateDetails(req.params.certId);
        
        // Convert BigInt to string for JSON serialization
        const formattedCert = {
            ...certData.toObject(),
            issuedAt: certData.issuedAt.toString(),
            revokedAt: certData.revokedAt.toString(),
        };

        res.json(formattedCert);
    } catch (error) {
        console.error("Certificate Retrieval Error:", error);
        res.status(404).json({ error: "Certificate not found" });
    }
});

// GET /api/certificate/:certId/audit - Fetch certificate specific audit trail
router.get("/:certId/audit", async (req, res) => {
    try {
        const contract = getContract(provider);
        const auditTrail = await contract.getAuditTrail(req.params.certId);
        
        const formattedAudit = auditTrail.map(entry => ({
            ...entry.toObject(),
            timestamp: entry.timestamp.toString(),
            result: Number(entry.result)
        }));

        res.json(formattedAudit);
    } catch (error) {
        console.error("Audit Retrieval Error:", error);
        res.status(500).json({ error: "Internal server error during audit retrieval" });
    }
});

module.exports = router;
