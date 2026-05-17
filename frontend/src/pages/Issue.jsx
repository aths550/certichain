import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { FileUpload } from "../components/FileUpload";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export const Issue = ({ account }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    certId: "",
    studentAddress: "",
    studentName: "",
    rollNumber: "",
    degree: "",
    institution: "MIT College of Engineering",
    cgpa: "",
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return setStatus({ ...status, error: "Please connect your wallet first." });
    if (!file) return setStatus({ ...status, error: "Please upload a certificate PDF." });

    try {
      setStatus({ loading: true, error: null, success: null });

      // 1. Get SHA-256 Hash from backend
      const hashFormData = new FormData();
      hashFormData.append("certificate", file);
      const hashRes = await axios.post("/api/hash", hashFormData);
      const fileHash = hashRes.data.hash;

      // 2. Upload to IPFS via backend
      const ipfsRes = await axios.post("/api/ipfs", hashFormData);
      const ipfsCID = ipfsRes.data.ipfsCID;

      // 3. Interact with Smart Contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.issueCertificate(
        formData.certId,
        fileHash,
        ipfsCID,
        formData.studentAddress,
        formData.studentName,
        formData.rollNumber,
        formData.degree,
        formData.institution,
        formData.cgpa
      );

      await tx.wait();
      setStatus({ loading: false, error: null, success: `Certificate ${formData.certId} issued successfully!` });
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: err.reason || err.message || "Failed to issue certificate.", success: null });
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Issue Certificate</h1>
        <p className="text-slate-400">Register a new academic credential on the blockchain.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-morphism p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Certificate ID</label>
              <input
                required
                name="certId"
                className="input-field w-full"
                placeholder="MIT-2024-001"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Student Wallet Address</label>
              <input
                required
                name="studentAddress"
                className="input-field w-full"
                placeholder="0x..."
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Student Full Name</label>
              <input
                required
                name="studentName"
                className="input-field w-full"
                placeholder="John Doe"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Roll Number</label>
              <input
                required
                name="rollNumber"
                className="input-field w-full"
                placeholder="2024CS01"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Degree</label>
              <input
                required
                name="degree"
                className="input-field w-full"
                placeholder="B.Tech in Computer Science"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">CGPA</label>
              <input
                required
                name="cgpa"
                className="input-field w-full"
                placeholder="9.5"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Certificate PDF</label>
            <FileUpload onFileSelect={setFile} />
          </div>
        </div>

        {status.error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{status.error}</p>
          </div>
        )}

        {status.success && (
          <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-xl flex items-center gap-3 text-green-500">
            <CheckCircle2 size={20} />
            <p className="text-sm font-medium">{status.success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          {status.loading ? (
            <>
              <Loader2 className="animate-spin" size={24} /> Issuing...
            </>
          ) : (
            <>
              <Send size={20} /> Issue Certificate
            </>
          )}
        </button>
      </form>
    </div>
  );
};
