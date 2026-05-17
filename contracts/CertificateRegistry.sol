// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CertificateRegistry is AccessControl {
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant COLLEGE_ADMIN_ROLE = keccak256("COLLEGE_ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    enum VerificationResult { VALID, HASH_MISMATCH, REVOKED, NOT_FOUND }

    struct Certificate {
        string certId;
        string sha256Hash;
        string ipfsCID;
        address issuerAddress;
        address studentAddress;
        string studentName;
        string rollNumber;
        string degree;
        string institution;
        string cgpa;
        uint256 issuedAt;
        bool isRevoked;
        string revocationReason;
        uint256 revokedAt;
        address revokedBy;
    }

    struct AuditEntry {
        string certId;
        address verifier;
        uint256 timestamp;
        VerificationResult result;
        string submittedHash;
    }

    struct College {
        string name;
        address adminAddress;
        bool isActive;
        uint256 registeredAt;
        uint256 certificatesIssued;
    }

    mapping(string => Certificate) private certificates;
    mapping(address => string[]) private studentCertificates;
    mapping(string => AuditEntry[]) private auditTrail;
    mapping(address => College) public colleges;
    string[] private allCertificateIds;
    AuditEntry[] private globalAuditLog;

    event CertificateIssued(string indexed certId, address indexed issuer, address indexed student, string sha256Hash);
    event CertificateVerified(string indexed certId, address indexed verifier, VerificationResult result);
    event CertificateRevoked(string indexed certId, address indexed revokedBy, string reason);
    event CollegeRegistered(address indexed adminAddress, string name);

    modifier onlySuperAdmin() {
        require(hasRole(SUPER_ADMIN_ROLE, msg.sender), "Caller is not a super admin");
        _;
    }

    modifier onlyCollegeAdmin() {
        require(hasRole(COLLEGE_ADMIN_ROLE, msg.sender), "Caller is not a college admin");
        require(colleges[msg.sender].isActive, "College is not active");
        _;
    }

    modifier certExists(string memory _certId) {
        require(bytes(certificates[_certId].certId).length > 0, "Certificate does not exist");
        _;
    }

    modifier certNotRevoked(string memory _certId) {
        require(!certificates[_certId].isRevoked, "Certificate is revoked");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN_ROLE, msg.sender);
    }

    // Role Management
    function grantRole(bytes32 role, address account) public override onlySuperAdmin {
        super.grantRole(role, account);
        emit RoleGranted(role, account, msg.sender);
    }

    function revokeRole(bytes32 role, address account) public override onlySuperAdmin {
        super.revokeRole(role, account);
        emit RoleRevoked(role, account, msg.sender);
    }

    // College Management
    function registerCollege(address _admin, string memory _name) public onlySuperAdmin {
        colleges[_admin] = College({
            name: _name,
            adminAddress: _admin,
            isActive: true,
            registeredAt: block.timestamp,
            certificatesIssued: 0
        });
        _grantRole(COLLEGE_ADMIN_ROLE, _admin);
        emit CollegeRegistered(_admin, _name);
    }

    function setCollegeStatus(address _admin, bool _status) public onlySuperAdmin {
        colleges[_admin].isActive = _status;
    }

    // Certificate Issuance
    function issueCertificate(
        string memory _certId,
        string memory _sha256Hash,
        string memory _ipfsCID,
        address _studentAddress,
        string memory _studentName,
        string memory _rollNumber,
        string memory _degree,
        string memory _institution,
        string memory _cgpa
    ) public onlyCollegeAdmin {
        require(bytes(certificates[_certId].certId).length == 0, "Certificate ID already exists");

        certificates[_certId] = Certificate({
            certId: _certId,
            sha256Hash: _sha256Hash,
            ipfsCID: _ipfsCID,
            issuerAddress: msg.sender,
            studentAddress: _studentAddress,
            studentName: _studentName,
            rollNumber: _rollNumber,
            degree: _degree,
            institution: _institution,
            cgpa: _cgpa,
            issuedAt: block.timestamp,
            isRevoked: false,
            revocationReason: "",
            revokedAt: 0,
            revokedBy: address(0)
        });

        studentCertificates[_studentAddress].push(_certId);
        allCertificateIds.push(_certId);
        colleges[msg.sender].certificatesIssued++;

        _grantRole(STUDENT_ROLE, _studentAddress);

        emit CertificateIssued(_certId, msg.sender, _studentAddress, _sha256Hash);
    }

    // Verification Logic
    function verifyCertificate(string memory _certId, string memory _submittedHash) public returns (VerificationResult) {
        VerificationResult result;
        Certificate storage cert = certificates[_certId];

        if (bytes(cert.certId).length == 0) {
            result = VerificationResult.NOT_FOUND;
        } else if (cert.isRevoked) {
            result = VerificationResult.REVOKED;
        } else if (keccak256(abi.encodePacked(cert.sha256Hash)) != keccak256(abi.encodePacked(_submittedHash))) {
            result = VerificationResult.HASH_MISMATCH;
        } else {
            result = VerificationResult.VALID;
        }

        AuditEntry memory entry = AuditEntry({
            certId: _certId,
            verifier: msg.sender,
            timestamp: block.timestamp,
            result: result,
            submittedHash: _submittedHash
        });

        auditTrail[_certId].push(entry);
        globalAuditLog.push(entry);

        emit CertificateVerified(_certId, msg.sender, result);
        return result;
    }

    function verifyCertificateView(string memory _certId, string memory _submittedHash) public view returns (VerificationResult) {
        Certificate storage cert = certificates[_certId];
        if (bytes(cert.certId).length == 0) return VerificationResult.NOT_FOUND;
        if (cert.isRevoked) return VerificationResult.REVOKED;
        if (keccak256(abi.encodePacked(cert.sha256Hash)) != keccak256(abi.encodePacked(_submittedHash))) return VerificationResult.HASH_MISMATCH;
        return VerificationResult.VALID;
    }

    // Getters
    function getCertificateDetails(string memory _certId) public view certExists(_certId) returns (Certificate memory) {
        return certificates[_certId];
    }

    function getStudentCertificates(address _student) public view returns (string[] memory) {
        return studentCertificates[_student];
    }

    function getCertificateHash(string memory _certId) public view certExists(_certId) returns (string memory) {
        return certificates[_certId].sha256Hash;
    }

    function getCertificateIPFSCID(string memory _certId) public view certExists(_certId) returns (string memory) {
        return certificates[_certId].ipfsCID;
    }

    function getRevocationStatus(string memory _certId) public view certExists(_certId) returns (bool, string memory, uint256, address) {
        Certificate storage cert = certificates[_certId];
        return (cert.isRevoked, cert.revocationReason, cert.revokedAt, cert.revokedBy);
    }

    function revokeCertificate(string memory _certId, string memory _reason) public certExists(_certId) certNotRevoked(_certId) {
        require(hasRole(SUPER_ADMIN_ROLE, msg.sender) || certificates[_certId].issuerAddress == msg.sender, "Not authorized to revoke");
        
        certificates[_certId].isRevoked = true;
        certificates[_certId].revocationReason = _reason;
        certificates[_certId].revokedAt = block.timestamp;
        certificates[_certId].revokedBy = msg.sender;

        emit CertificateRevoked(_certId, msg.sender, _reason);
    }

    function getAuditTrail(string memory _certId) public view returns (AuditEntry[] memory) {
        return auditTrail[_certId];
    }

    function getVerificationCount(string memory _certId) public view returns (uint256) {
        return auditTrail[_certId].length;
    }

    function getGlobalAuditLog() public view returns (AuditEntry[] memory) {
        return globalAuditLog;
    }

    function getTotalCertificates() public view returns (uint256) {
        return allCertificateIds.length;
    }

    function getAllCertificateIds() public view returns (string[] memory) {
        return allCertificateIds;
    }

    function computeHash(string memory _data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_data));
    }
}
