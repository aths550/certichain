const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ARTIFACT_PATH = path.join(__dirname, "../../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");

let abi = [];
try {
    const artifact = JSON.parse(fs.readFileSync(CONTRACT_ARTIFACT_PATH, "utf8"));
    abi = artifact.abi;
} catch (error) {
    console.error("Error loading contract ABI:", error);
}

const getContract = (providerOrSigner) => {
    return new ethers.Contract(CONTRACT_ADDRESS, abi, providerOrSigner);
};

module.exports = {
    getContract,
    CONTRACT_ADDRESS,
    ABI: abi
};
