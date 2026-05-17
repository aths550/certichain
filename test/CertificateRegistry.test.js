const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let registry;
  let owner;
  let collegeAdmin;
  let student;
  let verifier;
  let otherAccount;

  const SUPER_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SUPER_ADMIN_ROLE"));
  const COLLEGE_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("COLLEGE_ADMIN_ROLE"));
  const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));
  const STUDENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("STUDENT_ROLE"));

  const sampleCert = {
    id: "CERT-2025-001",
    hash: "0x3a7f9b4e2c1d8f6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p0q7r8s9t0u1v2w3x4y",
    cid: "QmXoypizjW3Wkn2ZvcBFr24Hps7n8Q8xsjVLzmdn1p5n1L",
    name: "Alice Smith",
    roll: "2025-CS-001",
    degree: "B.Tech Computer Science",
    institution: "MIT COE",
    cgpa: "9.5"
  };

  beforeEach(async function () {
    [owner, collegeAdmin, student, verifier, otherAccount] = await ethers.getSigners();
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    registry = await CertificateRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment & Access Control", function () {
    it("1. Should set the deployer as SUPER_ADMIN", async function () {
      expect(await registry.hasRole(SUPER_ADMIN_ROLE, owner.address)).to.equal(true);
    });

    it("2. Should revert when a non-admin tries to register a college", async function () {
      await expect(
        registry.connect(otherAccount).registerCollege(collegeAdmin.address, "Fake Uni")
      ).to.be.revertedWith("Caller is not a super admin");
    });
  });

  describe("College Management", function () {
    it("3. Should register a college and grant COLLEGE_ADMIN_ROLE", async function () {
      await expect(registry.registerCollege(collegeAdmin.address, "MIT COE"))
        .to.emit(registry, "CollegeRegistered")
        .withArgs(collegeAdmin.address, "MIT COE");

      expect(await registry.hasRole(COLLEGE_ADMIN_ROLE, collegeAdmin.address)).to.equal(true);
      const college = await registry.colleges(collegeAdmin.address);
      expect(college.name).to.equal("MIT COE");
    });
  });

  describe("Certificate Issuance", function () {
    beforeEach(async function () {
      await registry.registerCollege(collegeAdmin.address, "MIT COE");
    });

    it("4. Should issue a certificate and emit CertificateIssued", async function () {
      await expect(
        registry.connect(collegeAdmin).issueCertificate(
          sampleCert.id,
          sampleCert.hash,
          sampleCert.cid,
          student.address,
          sampleCert.name,
          sampleCert.roll,
          sampleCert.degree,
          sampleCert.institution,
          sampleCert.cgpa
        )
      ).to.emit(registry, "CertificateIssued")
       .withArgs(sampleCert.id, collegeAdmin.address, student.address, sampleCert.hash);
    });

    it("5. Should store correct metadata after issuance", async function () {
      await registry.connect(collegeAdmin).issueCertificate(
        sampleCert.id, sampleCert.hash, sampleCert.cid, student.address,
        sampleCert.name, sampleCert.roll, sampleCert.degree, sampleCert.institution, sampleCert.cgpa
      );

      const cert = await registry.getCertificateDetails(sampleCert.id);
      expect(cert.studentName).to.equal(sampleCert.name);
      expect(cert.sha256Hash).to.equal(sampleCert.hash);
      expect(await registry.hasRole(STUDENT_ROLE, student.address)).to.equal(true);
    });

    it("6. Should revert on duplicate certificate ID", async function () {
      await registry.connect(collegeAdmin).issueCertificate(
        sampleCert.id, sampleCert.hash, sampleCert.cid, student.address,
        sampleCert.name, sampleCert.roll, sampleCert.degree, sampleCert.institution, sampleCert.cgpa
      );

      await expect(
        registry.connect(collegeAdmin).issueCertificate(
          sampleCert.id, sampleCert.hash, sampleCert.cid, student.address,
          sampleCert.name, sampleCert.roll, sampleCert.degree, sampleCert.institution, sampleCert.cgpa
        )
      ).to.be.revertedWith("Certificate ID already exists");
    });
  });

  describe("Verification Registry", function () {
    beforeEach(async function () {
      await registry.registerCollege(collegeAdmin.address, "MIT COE");
      await registry.connect(collegeAdmin).issueCertificate(
        sampleCert.id, sampleCert.hash, sampleCert.cid, student.address,
        sampleCert.name, sampleCert.roll, sampleCert.degree, sampleCert.institution, sampleCert.cgpa
      );
    });

    it("7. Should return VALID for matching hash", async function () {
        // We use verifyCertificate which is a state-changing function to record the audit trail
        const result = await registry.verifyCertificateView(sampleCert.id, sampleCert.hash);
        expect(result).to.equal(0); // VALID
    });

    it("8. Should return HASH_MISMATCH for wrong hash", async function () {
        const result = await registry.verifyCertificateView(sampleCert.id, "0xfakehash");
        expect(result).to.equal(1); // HASH_MISMATCH
    });

    it("9. Should return NOT_FOUND for unknown ID", async function () {
        const result = await registry.verifyCertificateView("UNKNOWN", sampleCert.hash);
        expect(result).to.equal(3); // NOT_FOUND
    });
  });

  describe("Revocation & Auditing", function () {
    beforeEach(async function () {
      await registry.registerCollege(collegeAdmin.address, "MIT COE");
      await registry.connect(collegeAdmin).issueCertificate(
        sampleCert.id, sampleCert.hash, sampleCert.cid, student.address,
        sampleCert.name, sampleCert.roll, sampleCert.degree, sampleCert.institution, sampleCert.cgpa
      );
    });

    it("10. Should allow Super Admin to revoke a certificate", async function () {
      await expect(registry.revokeCertificate(sampleCert.id, "Academic Misconduct"))
        .to.emit(registry, "CertificateRevoked")
        .withArgs(sampleCert.id, owner.address, "Academic Misconduct");

      const status = await registry.getRevocationStatus(sampleCert.id);
      expect(status[0]).to.equal(true); // isRevoked
    });

    it("11. Should return REVOKED status after revocation", async function () {
      await registry.revokeCertificate(sampleCert.id, "Revoked");
      const result = await registry.verifyCertificateView(sampleCert.id, sampleCert.hash);
      expect(result).to.equal(2); // REVOKED
    });

    it("12. Should revert if revoking an already revoked certificate", async function () {
      await registry.revokeCertificate(sampleCert.id, "First Revoke");
      await expect(
        registry.revokeCertificate(sampleCert.id, "Second Revoke")
      ).to.be.revertedWith("Certificate is revoked");
    });

    it("13. Should record every verification in the audit trail", async function () {
      await registry.connect(verifier).verifyCertificate(sampleCert.id, sampleCert.hash);
      await registry.connect(otherAccount).verifyCertificate(sampleCert.id, "0xwrong");
      
      const trail = await registry.getAuditTrail(sampleCert.id);
      expect(trail.length).to.equal(2);
      expect(trail[0].verifier).to.equal(verifier.address);
      expect(trail[1].result).to.equal(1); // HASH_MISMATCH
    });
  });

  describe("Complex Access Control", function () {
    it("14. Should prevent deactivated colleges from issuing certificates", async function () {
      await registry.registerCollege(collegeAdmin.address, "MIT COE");
      await registry.setCollegeStatus(collegeAdmin.address, false);

      await expect(
        registry.connect(collegeAdmin).issueCertificate(
          sampleCert.id, sampleCert.hash, sampleCert.cid, student.address,
          sampleCert.name, sampleCert.roll, sampleCert.degree, sampleCert.institution, sampleCert.cgpa
        )
      ).to.be.revertedWith("College is not active");
    });

    it("15. Should allow non-issuing Super Admin to revoke any certificate", async function () {
      await registry.registerCollege(collegeAdmin.address, "MIT COE");
      await registry.connect(collegeAdmin).issueCertificate(
          sampleCert.id, sampleCert.hash, sampleCert.cid, student.address,
          sampleCert.name, sampleCert.roll, sampleCert.degree, sampleCert.institution, sampleCert.cgpa
      );

      // owner is super admin but NOT the issuer (collegeAdmin is issuer)
      await expect(registry.connect(owner).revokeCertificate(sampleCert.id, "Global Override"))
        .to.emit(registry, "CertificateRevoked");
    });
  });
});
