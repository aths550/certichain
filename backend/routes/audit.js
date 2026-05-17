const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { getContract } = require("../utils/contract");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:7545");

// GET /api/audit - Fetch global audit log (paginated)
router.get("/", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 20;

        const contract = getContract(provider);
        const globalAudit = await contract.getGlobalAuditLog();
        
        // Manual pagination on the array for now, as the contract returns all
        const paginatedAudit = globalAudit.slice(offset, offset + limit).map(entry => ({
            ...entry.toObject(),
            timestamp: entry.timestamp.toString(),
            result: Number(entry.result)
        }));

        res.json({
            data: paginatedAudit,
            total: globalAudit.length,
            offset,
            limit
        });
    } catch (error) {
        console.error("Global Audit Error:", error);
        res.status(500).json({ error: "Internal server error during audit retrieval" });
    }
});

module.exports = router;
