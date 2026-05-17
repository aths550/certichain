const { ethers } = require("ethers");
const { getContract, ABI } = require("../utils/contract");

const auth = async (req, res, next) => {
    // accept 'wallet-address' from old frontend or 'x-wallet-address'
    const walletAddress = req.headers["x-wallet-address"] || req.headers["wallet-address"];

    if (!walletAddress) {
        return res.status(401).json({ error: "No wallet address provided" });
    }

    try {
        // Since we are using local auth for dashboard, skip on-chain role verification for IPFS upload
        // The actual contract call will enforce permissions during the transaction
        req.userAddress = walletAddress;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ error: "Internal server error during authentication" });
    }
};

module.exports = auth;
