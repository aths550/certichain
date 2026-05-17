const hre = require("hardhat");
const { CONTRACT_ADDRESS, CONTRACT_ABI } = require("../frontend/src/utils/contract");

async function main() {
  const [admin] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, admin);

  console.log("Issuing a second manual certificate for 'User Test Student'...");
  
  const certId = `USER-${Date.now()}`;
  const sha256Hash = "0x" + "a1b2c3d4e5f6071829304152637485960a1b2c3d4e5f60718293041526374859"; // Dummy hash
  const ipfsCID = "QmDemoUserTest";
  const studentAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1

  const tx = await contract.issueCertificate(
    certId,
    sha256Hash,
    ipfsCID,
    studentAddress,
    "User Test Student",
    "2025-USER-01",
    "B.S. Blockchain Development",
    "MIT College of Engineering",
    "10.0"
  );

  console.log("Awaiting confirmation...");
  await tx.wait();

  console.log("✅ Successfully issued manual certificate!");
  console.log("ID:", certId);
  console.log("Verify at:", `http://localhost:5173/verify?id=${certId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
