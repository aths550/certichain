import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { FileUpload } from "../components/FileUpload";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { ShieldCheck, ShieldAlert, Loader2, Search, FileText, Calendar, Building, User } from "lucide-react";

export const Verify = () => {
  const [file, setFile] = useState(null);
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState({ loading: false, result: null, error: null });

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!file || !certId) return setStatus({ ...status, error: "Please provide both Certificate ID and PDF file." });

    try {
      setStatus({ ...status, loading: true, error: null, result: null });

      // 1. Get Hash from backend
      const hashFormData = new FormData();
      hashFormData.append("certificate", file);
      const hashRes = await axios.post("/api/hash", hashFormData);
      const fileHash = hashRes.data.hash;

      // 2. Call contract (view function first)
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Fallback to local RPC if no wallet
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const verificationResult = await contract.verifyCertificateView(certId, fileHash);
      const resultEnum = ["VALID", "HASH_MISMATCH", "REVOKED", "NOT_FOUND"];
      const resultString = resultEnum[Number(verificationResult)];

      let details = null;
      if (resultString === "VALID" || resultString === "REVOKED" || resultString === "HASH_MISMATCH") {
        details = await contract.getCertificateDetails(certId);
      }

      setStatus({ loading: false, result: { status: resultString, details }, error: null });
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, result: null, error: "Verification failed. Ensure the ID is correct." });
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">Verify Credential</h1>
        <p className="text-slate-400">Instantly check the authenticity of any CertChain certificate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={handleVerify} className="md:col-span-2 space-y-6">
          <div className="glass-morphism p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Certificate ID</label>
              <input
                required
                className="input-field w-full"
                placeholder="e.g. MIT-2024-001"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Upload PDF</label>
              <FileUpload onFileSelect={setFile} />
            </div>
            <button
              disabled={status.loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              {status.loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              Verify Now
            </button>
          </div>
        </form>

        <div className="md:col-span-1">
          {status.result ? (
            <div className={`glass-morphism p-8 border-t-4 h-full ${
              status.result.status === "VALID" ? "border-t-green-500" : "border-t-red-500"
            }`}>
              <div className="text-center mb-6">
                {status.result.status === "VALID" ? (
                  <ShieldCheck className="text-green-500 mx-auto mb-2" size={48} />
                ) : (
                  <ShieldAlert className="text-red-500 mx-auto mb-2" size={48} />
                )}
                <h3 className={`text-2xl font-bold ${
                  status.result.status === "VALID" ? "text-green-500" : "text-red-500"
                }`}>
                  {status.result.status}
                </h3>
              </div>

              {status.result.details && status.result.status !== "NOT_FOUND" && (
                <div className="space-y-4">
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Credential Info</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-slate-400" />
                        <span className="text-slate-300">{status.result.details.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building size={16} className="text-slate-400" />
                        <span className="text-slate-300">{status.result.details.institution}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-slate-300">{status.result.details.degree}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-slate-300">Issued: {new Date(Number(status.result.details.issuedAt) * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {status.result.status === "REVOKED" && (
                     <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4">
                        <p className="text-xs text-red-400 font-bold uppercase mb-1">Reason for Revocation</p>
                        <p className="text-sm text-red-200">{status.result.details.revocationReason}</p>
                     </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-morphism p-8 h-full flex flex-col items-center justify-center text-center text-slate-500 border-dashed">
              <ShieldCheck size={48} className="mb-4 opacity-20" />
              <p>Upload a certificate to see verification details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
