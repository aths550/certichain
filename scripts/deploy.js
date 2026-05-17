const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("🚀 Starting Deployment of CertChain Registry...");
  console.log("----------------------------------------------------");
  console.log("Deployer Account:", deployer.address);

  // 1. Deploy Contract
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const registry = await CertificateRegistry.deploy();
  await registry.waitForDeployment();
  const contractAddress = await registry.getAddress();
  
  console.log("✅ CertificateRegistry deployed to:", contractAddress);

  // 2. Extract and Save ABI + Address
  const artifactPath = path.join(__dirname, "../artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json");
  if (!fs.existsSync(artifactPath)) {
      throw new Error("Artifacts not found. Please run 'npx hardhat compile' first.");
  }
  
  const abi = JSON.parse(fs.readFileSync(artifactPath, "utf8")).abi;
  const contractData = `export const CONTRACT_ADDRESS = "${contractAddress}";
export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)};
`;

  const frontendPath = path.join(__dirname, "../frontend/src/utils/contract.js");
  fs.writeFileSync(frontendPath, contractData);
  console.log("📝 Contract definitions exported to frontend.");

  // 3. Register First College (Demo)
  console.log("🔹 Registering MIT College of Engineering...");
  const regTx = await registry.registerCollege(deployer.address, "MIT College of Engineering");
  await regTx.wait();
  console.log("   Done.");

  // 4. Grant Verifier Role
  const demoVerifier = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Standard Hardhat #2
  console.log(`🔹 Granting VERIFIER_ROLE to demo verifier: ${demoVerifier}`);
  const VERIFIER_ROLE = await registry.VERIFIER_ROLE();
  const grantTx = await registry.grantRole(VERIFIER_ROLE, demoVerifier);
  await grantTx.wait();
  console.log("   Done.");

  // 5. Issue Sample Certificate (Demo)
  console.log("🔹 Issuing sample certificate for demo...");
  const sampleCertId = "CERT-2025-Demo01";
  const sampleHash = "3a7f9b4e2c1d8f6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p0q7r8s9t0u1v2w3x4y";
  const sampleCID = "QmXoypizjW3Wkn2ZvcBFr24Hps7n8Q8xsjVLzmdn1p5n1L";
  
  const issueTx = await registry.issueCertificate(
    sampleCertId,
    "0x" + sampleHash,
    sampleCID,
    deployer.address,
    "Demo Student",
    "2025-CS-001",
    "B.Tech Computer Science",
    "MIT College of Engineering",
    "9.8"
  );
  await issueTx.wait();
  console.log(`✅ Sample Certificate Issued: ${sampleCertId}`);
  
  console.log("----------------------------------------------------");
  console.log("🌟 Deployment Summary");
  console.log("----------------------------------------------------");
  console.log("Network: ", hre.network.name);
  console.log("Contract:", contractAddress);
  console.log("College: MIT College of Engineering");
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
