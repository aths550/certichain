const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { getContract } = require("../utils/contract");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545");

// GET /api/stats/test - Debug
router.get("/test", (req, res) => {
    res.json({ message: "Stats router is reachable" });
});

// GET /api/stats - Global and per-institution statistics
router.get("/", async (req, res) => {
    console.log("Stats API hit");

    try {
        const contract = getContract(provider);
        
        // Fetch base data
        const [totalCertificates, auditLog, allIds] = await Promise.all([
            contract.getTotalCertificates(),
            contract.getGlobalAuditLog(),
            contract.getAllCertificateIds()
        ]);

        // If no certificates, return empty stats immediately
        if (allIds.length === 0) {
            return res.json({
                global: {
                    issued: 0,
                    verified: auditLog.length,
                    revoked: 0
                },
                byInstitution: {}
            });
        }

        // Fetch all certificate details for aggregation
        // Optimization: In a real production app, we would index this in a DB (Graph/Subsquid)
        const allCerts = await Promise.all(
            allIds.map(id => contract.getCertificateDetails(id))
        );

        const stats = {
            global: {
                issued: Number(totalCertificates),
                verified: auditLog.length,
                revoked: 0
            },
            byInstitution: {}
        };

        allCerts.forEach(cert => {
            const inst = cert.institution || "Unknown";
            if (!stats.byInstitution[inst]) {
                stats.byInstitution[inst] = { issued: 0, verified: 0, revoked: 0, lastActive: 0 };
            }
            stats.byInstitution[inst].issued++;
            
            const issuedAt = Number(cert.issuedAt);
            if (issuedAt > stats.byInstitution[inst].lastActive) {
                stats.byInstitution[inst].lastActive = issuedAt;
            }

            if (cert.isRevoked) {
                stats.byInstitution[inst].revoked++;
                stats.global.revoked++;
            }
        });

        // Match verifications to institutions
        const certToInst = {};
        allCerts.forEach(c => {
            certToInst[c.certId] = c.institution;
        });

        auditLog.forEach(log => {
            const inst = certToInst[log.certId];
            if (inst && stats.byInstitution[inst]) {
                stats.byInstitution[inst].verified++;
                const verifiedAt = Number(log.timestamp);
                if (verifiedAt > stats.byInstitution[inst].lastActive) {
                    stats.byInstitution[inst].lastActive = verifiedAt;
                }
            }
        });


        res.json(stats);
    } catch (error) {
        console.error("Stats Aggregation Error:", error);
        res.status(500).json({ error: "Failed to aggregate statistics" });
    }
});

module.exports = router;
