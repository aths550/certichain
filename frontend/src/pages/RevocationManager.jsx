import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Trash2, 
  X, 
  History, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  Info,
  Mail,
  Lock
} from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import Sidebar from "../components/Sidebar";

const RevocationManager = ({ account }) => {
  const [revokedCerts, setRevokedCerts] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [targetCert, setTargetCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  // 1. Fetch Revoked Certificates
  useEffect(() => {
    loadRevocations();
  }, []);

  const loadRevocations = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const ids = await contract.getAllCertificateIds();
      const allCerts = await Promise.all(
        ids.map(async (id) => await contract.getCertificateDetails(id))
      );
      
      setRevokedCerts(allCerts.filter(c => c.isRevoked).reverse());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // 2. Search Logic
  const handleSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    setTargetCert(null);
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.getCertificateDetails(searchId);
      setTargetCert(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Revocation Execution
  const handleRevoke = async () => {
    if (reason.length < 20) return;
    setStatus({ loading: true, error: null, success: null });
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.revokeCertificate(targetCert.certId, reason);
      const receipt = await tx.wait();

      // Placeholder for email notification
      try {
        await axios.post("/api/notify", {
           certId: targetCert.certId,
           reason: reason,
           student: targetCert.studentAddress
        });
      } catch (e) {
        console.warn("Notification skipped (backend endpoint not live)");
      }

      setStatus({ loading: false, error: null, success: `Certificate revoked — Block ${receipt.blockNumber.toLocaleString()}` });
      setShowModal(false);
      setTargetCert(null);
      setSearchId("");
      loadRevocations();
    } catch (err) {
      setStatus({ loading: false, error: err.reason || "Transaction failed.", success: null });
    }
  };

  return (
    <div className="bg-[#051120] min-h-screen text-slate-200">
      <Sidebar />
      <main className="ml-[75px] pb-20 overflow-y-auto min-h-screen transition-all duration-300">
      {/* Header & Warning Banner */}
      <div className="bg-primary/20 border-b border-white/5 py-12">
        <div className="container mx-auto px-6">
           <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Certificate revocation</h1>
           <p className="text-red-500 font-bold text-sm tracking-tight">Revocations are permanent and irreversible on the Ethereum blockchain</p>
        </div>
      </div>

      <div className="warning-banner w-full py-4 px-6 mb-12 flex items-center gap-4 shadow-lg shadow-amber-900/10">
         <AlertTriangle size={20} className="text-amber-600" />
         <p className="text-sm font-bold">
           Revoking a certificate permanently marks it invalid on-chain. This action cannot be undone. Issue a new corrected certificate if needed.
         </p>
      </div>

      <div className="container mx-auto px-6 max-w-5xl space-y-16">
        {/* Search to Revoke */}
        <div className="glass-morphism p-10 border-red-500/20 bg-red-500/[0.01]">
           <div className="flex items-center gap-3 mb-8">
              <Trash2 className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold tracking-tight">Search to revoke</h2>
           </div>
           
           <div className="max-w-xl space-y-8">
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                       value={searchId}
                       onChange={(e) => setSearchId(e.target.value)}
                       className="input-field w-full pl-12" 
                       placeholder="Enter certificate ID..." 
                    />
                 </div>
                 <button onClick={handleSearch} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Inspect"}
                 </button>
              </div>

              {targetCert && (
                 <div className="glass-morphism p-6 border-white/10 animate-fade-slide relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rotate-45 translate-x-12 -translate-y-12" />
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Student</p>
                          <p className="text-sm font-bold text-white">{targetCert.studentName}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Degree</p>
                          <p className="text-sm font-bold text-white">{targetCert.degree}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            targetCert.isRevoked ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                          }`}>
                            {targetCert.isRevoked ? "Already Revoked" : "VALID RECORD"}
                          </span>
                       </div>
                    </div>
                    
                    <div className="mt-8">
                       {targetCert.isRevoked ? (
                          <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex gap-3">
                             <Info size={16} className="text-slate-500 flex-shrink-0" />
                             <p className="text-xs text-slate-400 italic">" {targetCert.revocationReason} "</p>
                          </div>
                       ) : (
                          <button onClick={() => setShowModal(true)} className="btn-primary w-full py-3 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2">
                             <ShieldAlert size={18} /> Revoke this certificate
                          </button>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Active Revocations Table */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <History size={24} className="text-slate-500" />
                 <h2 className="text-2xl font-bold tracking-tight">Active revocations</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{revokedCerts.length} VOIDED RECORDS</span>
           </div>

           <div className="glass-morphism border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                 <thead>
                    <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                       <th className="px-8 py-4">Student</th>
                       <th className="px-8 py-4">Cert ID</th>
                       <th className="px-8 py-4">Revoked On</th>
                       <th className="px-8 py-4">Reason</th>
                       <th className="px-8 py-4 text-right">Revoked By</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {revokedCerts.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                             <div className="flex flex-col items-center gap-4 opacity-30">
                                <CheckCircle2 size={40} className="text-green-500" />
                                <span className="font-bold uppercase tracking-widest">No active revocations</span>
                             </div>
                          </td>
                       </tr>
                    ) : revokedCerts.map((cert, i) => (
                       <tr key={i} className="hover:bg-red-500/[0.02] transition-colors revocation-row animate-fade-up" style={{ animationDelay: `${i*100}ms` }}>
                          <td className="px-8 py-6">
                             <p className="font-bold text-white">{cert.studentName}</p>
                             <p className="text-slate-500 text-[10px]">{cert.degree}</p>
                          </td>
                          <td className="px-8 py-6 font-mono text-slate-400 break-all">{cert.certId}</td>
                          <td className="px-8 py-6 text-slate-500">{new Date(Number(cert.revokedAt) * 1000).toLocaleDateString()}</td>
                          <td className="px-8 py-6">
                             <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1.5 w-max uppercase border border-red-500/10">
                                {cert.revocationReason}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right font-mono text-slate-600 truncate max-w-[120px]">
                             {cert.revokedBy}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Revocation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
           <div className="bg-[#0D1117] border border-red-500/30 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-fade-slide">
              <div className="p-8 space-y-6 text-center">
                 <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <AlertTriangle className="text-red-500 animate-pulse" size={40} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Are you absolutely sure?</h3>
                    <p className="text-sm text-slate-400">You are about to permanently void the certificate for <strong>{targetCert.studentName}</strong> ({targetCert.certId}).</p>
                 </div>

                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revocation Reason (Required)</label>
                    <textarea 
                       value={reason}
                       onChange={(e) => setReason(e.target.value)}
                       className="input-field w-full min-h-[120px] py-3 text-sm leading-relaxed" 
                       placeholder="Detail why this record is being voided..."
                    />
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase mt-1">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Mail size={12} /> Email notice will be queued
                       </div>
                       <span className={reason.length < 20 ? "text-red-500" : "text-green-500"}>{reason.length} / 20 chars min</span>
                    </div>
                 </div>

                 <div className="p-4 bg-slate-900/50 rounded-2xl text-left border border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center gap-2">
                       <Lock size={12} /> Reason hints
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {["Degree not awarded", "Plagiarism", "Data entry error"].map(hint => (
                          <button key={hint} onClick={() => setReason(hint + " — ")} className="text-[10px] font-medium bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all">{hint}</button>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button onClick={() => setShowModal(false)} className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:text-white transition-all uppercase text-xs">Cancel</button>
                    <button 
                       disabled={reason.length < 20 || status.loading}
                       onClick={handleRevoke}
                       className="flex-1 btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                       {status.loading ? <Loader2 className="animate-spin" /> : <ShieldAlert size={18} />}
                       Confirm revocation
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Success Toast */}
      {status.success && (
         <div className="fixed bottom-10 right-10 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-green-900/40 animate-fade-slide z-[60] flex items-center gap-4">
            <CheckCircle2 size={24} />
            <div>
               <p className="text-sm font-bold">Revocation Confirmed</p>
               <p className="text-[10px] opacity-80">{status.success}</p>
            </div>
            <button onClick={() => setStatus({ ...status, success: null })} className="p-1 hover:bg-white/20 rounded-lg"><X size={16} /></button>
         </div>
      )}
      </main>
    </div>
  );
};

export default RevocationManager;
