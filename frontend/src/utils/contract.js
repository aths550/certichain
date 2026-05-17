import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x5DDAdA4692Ec0a0a8e7F6Aa133CB4495FBEe5B2C";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "certId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "student",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "sha256Hash",
        "type": "string"
      }
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "certId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "revokedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "CertificateRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "certId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum CertificateRegistry.VerificationResult",
        "name": "result",
        "type": "uint8"
      }
    ],
    "name": "CertificateVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "adminAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "CollegeRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "COLLEGE_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "STUDENT_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SUPER_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "VERIFIER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "colleges",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "adminAddress",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "registeredAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "certificatesIssued",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_data",
        "type": "string"
      }
    ],
    "name": "computeHash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCertificateIds",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      }
    ],
    "name": "getAuditTrail",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "certId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "verifier",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum CertificateRegistry.VerificationResult",
            "name": "result",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "submittedHash",
            "type": "string"
          }
        ],
        "internalType": "struct CertificateRegistry.AuditEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      }
    ],
    "name": "getCertificateDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "certId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "sha256Hash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsCID",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "issuerAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "studentAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "studentName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "rollNumber",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "degree",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "institution",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cgpa",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "issuedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isRevoked",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "revocationReason",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "revokedAt",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "revokedBy",
            "type": "address"
          }
        ],
        "internalType": "struct CertificateRegistry.Certificate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      }
    ],
    "name": "getCertificateHash",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      }
    ],
    "name": "getCertificateIPFSCID",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalAuditLog",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "certId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "verifier",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum CertificateRegistry.VerificationResult",
            "name": "result",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "submittedHash",
            "type": "string"
          }
        ],
        "internalType": "struct CertificateRegistry.AuditEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      }
    ],
    "name": "getRevocationStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_student",
        "type": "address"
      }
    ],
    "name": "getStudentCertificates",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCertificates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      }
    ],
    "name": "getVerificationCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_sha256Hash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_ipfsCID",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_studentAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_rollNumber",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_degree",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_institution",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_cgpa",
        "type": "string"
      }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_admin",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "registerCollege",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_reason",
        "type": "string"
      }
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_admin",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_status",
        "type": "bool"
      }
    ],
    "name": "setCollegeStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_submittedHash",
        "type": "string"
      }
    ],
    "name": "verifyCertificate",
    "outputs": [
      {
        "internalType": "enum CertificateRegistry.VerificationResult",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_certId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_submittedHash",
        "type": "string"
      }
    ],
    "name": "verifyCertificateView",
    "outputs": [
      {
        "internalType": "enum CertificateRegistry.VerificationResult",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// --- Helpers ---

/**
 * Gets a resilient provider for the app.
 * Priority: MetaMask (BrowserProvider) > Hardcoded Infura/Alchemy Sepolia > Localhost
 */
export const getPublicProvider = async () => {
    try {
        // 1. Check if browser has MetaMask
        if (typeof window !== "undefined" && window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            // Quick check if the browser provider is responsive
            const network = await Promise.race([
                browserProvider.getNetwork(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
            ]);
            if (network) return browserProvider;
        }
    } catch (e) {
        console.warn("MetaMask provider requested but not responsive", e);
    }


    // 2. Fallback to common Sepolia RPCs
    const SEPOLIA_RPCs = [
        "https://rpc.ankr.com/eth_sepolia",
        "https://eth-sepolia.public.blastapi.io",
        "https://1rpc.io/sepolia",
        "https://gateway.tenderly.co/public/sepolia",
        "https://ethereum-sepolia.publicnode.com"
    ];

    for (const url of SEPOLIA_RPCs) {
        try {
            const tempProvider = new ethers.JsonRpcProvider(url);
            // Timeout check
            const network = await Promise.race([
                tempProvider.getNetwork(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
            ]);
            if (network) return tempProvider;
        } catch (e) {
            console.warn(`RPC Fallback failed for ${url}:`, e.message);
        }
    }


    // 3. Last resort: Local nodes
    try {
        const localProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const isLive = await Promise.race([
            localProvider.getBlockNumber(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000))
        ]);
        if (isLive !== undefined) return localProvider;
    } catch (e) {
        console.warn("Local Hardhat node not reachable on 8545");
    }

    return new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Legacy Ganache fallback

};

export const getContract = async (signerOrProvider) => {
    let p = signerOrProvider;
    if (!p) {
        p = await getPublicProvider();
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, p);
};

