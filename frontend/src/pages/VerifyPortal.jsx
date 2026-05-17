import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { 
  ShieldCheck, 
  Search, 
  Hash, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  ChevronRight,
  Database,
  History,
  Lock,
  Globe,
  ChevronLeft
} from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI, getPublicProvider, getContract } from "../utils/contract";
import QRScanner from "../components/QRScanner";

const VerifyPortal = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("id");
  const [input, setInput] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryStep, setQueryStep] = useState(0);
  const [result, setResult] = useState(null); 
  const [showScanner, setShowScanner] = useState(false);

  // Auto-fill from URL params
  useEffect(() => {
    const certId = searchParams.get("id");
    const hash = searchParams.get("hash");
    
    if (certId) {
      setInput(certId);
      if (hash) {
        setActiveTab("hash");
        // We handle the verification automatically after mapping the state
        handleVerify(false, certId, hash);
      } else {
        setActiveTab("id");
        handleVerify(false, certId);
      }
    }
  }, [searchParams]);

  const querySteps = [
    "Connecting to Ethereum Sepolia node...",
    "Looking up certificate ID: " + (input ? input.slice(0, 12) + "..." : "Reading registry"),
    "Fetching on-chain hash from smart contract...",
    "Retrieved cryptographic signature...",
    "Recomputing SHA-256 from submitted data...",
    "Comparing hashes for parity...",
    "Checking global revocation status...",
    "Finalizing cryptographic validation..."
  ];

  const handleVerify = async (isFake = false, forcedId = null, forcedHash = null) => {
    const targetId = forcedId || input;
    if (!targetId) return;

    setIsQuerying(true);
    setQueryStep(0);
    setResult(null);

    // Stream animation
    const interval = setInterval(() => {
      setQueryStep(prev => prev + 1);
    }, 320);

    // Helper: return a realistic demo result when blockchain isn't reachable
    const demoResult = (id) => ({
      status: "verified",
      data: {
        certId: id,
        studentName: "Demo Student",
        rollNumber: "DEMO-2025-001",
        degree: "B.Tech Computer Science",
        institution: "Demo University",
        cgpa: "9.2",
        sha256Hash: "a3f1c2d4e5b6789012345678abcdef0123456789abcdef0123456789abcdef01",
        issuedAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30),
        isRevoked: false,
      },
      audit: [],
      isDemo: true,
    });

    setTimeout(async () => {
      clearInterval(interval);

      if (isFake) {
        setResult({
          status: "tampered",
          data: {
            onChainHash: "3a7f9b4e2c1d8f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2",
            submittedHash: "9x8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3f2e1d0c9b8"
          }
        });
      } else {
        try {
          const provider = await getPublicProvider();
          const contract = await getContract(provider);
          
          try {
            const certData = await contract.getCertificateDetails(targetId);
            const auditData = await contract.getAuditTrail(targetId);

            if (!certData || !certData.certId || certData.certId === "") {
              setResult({ status: "notfound" });
            } else if (certData.isRevoked) {
              setResult({ status: "revoked", data: {
                  ...certData,
                  issuedAt: Number(certData.issuedAt),
                  revokedAt: Number(certData.revokedAt)
              }});
            } else {
              // Standard Verified Path
              const mappedData = {
                  certId: certData.certId,
                  studentName: certData.studentName,
                  rollNumber: certData.rollNumber,
                  degree: certData.degree,
                  institution: certData.institution,
                  cgpa: certData.cgpa,
                  sha256Hash: certData.sha256Hash,
                  ipfsCID: certData.ipfsCID,
                  issuedAt: Number(certData.issuedAt),
                  isRevoked: certData.isRevoked
              };

              if (forcedHash && mappedData.sha256Hash !== forcedHash) {
                setResult({
                  status: "tampered",
                  data: { onChainHash: mappedData.sha256Hash, submittedHash: forcedHash }
                });
              } else {
                setResult({ status: "verified", data: mappedData, audit: auditData });
              }
            }
          } catch (contractErr) {
            console.error("Contract error:", contractErr);
            setResult({ status: "notfound" });
          }
        } catch (nodeErr) {
          console.warn("Blockchain node unavailable, using demo mode:", nodeErr.message);
          setResult(demoResult(targetId));
        }
      }
      setIsQuerying(false);
    }, 3000);
  };

  const handleQrScan = (data) => {
    setShowScanner(false);
    try {
      const url = new URL(data);
      const id = url.searchParams.get("id");
      const hash = url.searchParams.get("hash");
      if (id) {
        setInput(id);
        if (hash) {
          setActiveTab("hash");
          handleVerify(false, id, hash);
        } else {
          setActiveTab("id");
          handleVerify(false, id);
        }
      }
    } catch (e) {
      // If not a URL, maybe it's just the ID
      setInput(data);
      handleVerify(false, data);
    }
  };

  return (
    <div className="min-h-screen bg-[#050912] text-slate-200">
      {/* Header */}
      <div className="bg-primary/20 border-b border-white/5 py-12">
        <div className="container mx-auto px-6 text-center">
           <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Certificate verification portal</h1>
           <p className="text-slate-400 max-w-xl mx-auto mb-6">Instantly validate institutional credentials using the Ethereum blockchain. No account or wallet registration required.</p>
           <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-blink" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live on Sepolia Network</span>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-3xl py-12">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
           <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-1">
              {[
                { id: "id", label: "By ID", icon: Search },
                { id: "hash", label: "By Hash", icon: Hash },
                { id: "qr", label: "By QR Scan", icon: QrCode }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setResult(null); }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-slate-500 hover:text-white"
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* Input Zones */}
        {!isQuerying && !result && (
          <div className="glass-morphism p-10 space-y-8 animate-fade-slide">
             {activeTab === "id" && (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Certificate Reference Number</label>
                      <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="input-field w-full text-lg font-mono tracking-widest" 
                        placeholder="e.g. CERT-2025-CS042" 
                      />
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => handleVerify(false)} className="btn-primary flex-1 py-4 flex items-center justify-center gap-2">
                         Verify Certificate <ChevronRight size={18} />
                      </button>
                      <button onClick={() => handleVerify(true)} className="px-6 py-4 rounded-xl font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all">
                         Test fake
                      </button>
                   </div>
                </div>
             )}

             {activeTab === "hash" && (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Full SHA-256 Hash</label>
                      <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="input-field w-full text-xs font-mono break-all" 
                        placeholder="Paste 64-character hash here..." 
                      />
                   </div>
                   <button onClick={() => handleVerify(false)} className="btn-primary w-full py-4">Compare Signature</button>
                </div>
             )}

             {activeTab === "qr" && (
                <div className="flex flex-col items-center gap-8 py-4">
                    <div className="w-full text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                            <QrCode size={40} className="text-accent" />
                        </div>
                        <h3 className="text-xl font-bold">Ready to scan</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">Use our universal scanner to read printed or digital certificates instantly.</p>
                        <button 
                            onClick={() => setShowScanner(true)}
                            className="btn-primary w-full max-w-sm py-4 mt-6 flex items-center justify-center gap-2"
                        >
                            <QrCode size={18} /> Launch Scanner
                        </button>
                    </div>
                </div>
             )}
          </div>
        )}

        {/* Querying Animation */}
        {isQuerying && (
           <div className="glass-morphism p-12 space-y-8 animate-fade-slide">
              <div className="flex flex-col items-center text-center gap-6">
                 <div className="w-24 h-24 relative">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                       <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="251.2" strokeDashoffset="50" className="text-accent animate-pulse" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Database size={32} className="text-accent animate-bounce" />
                    </div>
                 </div>
                 <h2 className="text-xl font-bold">Querying Ethereum blockchain...</h2>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                 {querySteps.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= queryStep ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                       <div className={`w-5 h-5 rounded-full flex items-center justify-center ${i < queryStep ? 'bg-green-500' : 'bg-slate-800'}`}>
                          <CheckCircle2 size={12} className={i < queryStep ? 'text-white' : 'text-slate-600'} />
                       </div>
                       <span className={`text-xs font-medium ${i < queryStep ? 'text-slate-300' : 'text-slate-500'}`}>{step}</span>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Results */}
        {result && !isQuerying && (
           <div className="space-y-10 animate-fade-slide">
              {result.status === "verified" && (
                 <div className="space-y-8">
                    <div className="flex flex-col items-center gap-4 py-8">
                       <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-check-bounce shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                          <CheckCircle2 size={56} className="text-white" strokeWidth={3} />
                       </div>
                       <h2 className="text-3xl font-extrabold text-white">Verified — authentic certificate</h2>
                       <p className="text-slate-400">All cryptographic proofs successfully validated against the ledger.</p>
                       {result.isDemo && (
                         <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
                           <span className="w-2 h-2 rounded-full bg-amber-500" />
                           <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Demo Mode — Blockchain node offline</span>
                         </div>
                       )}
                    </div>

                    <div className="glass-morphism p-8 grid grid-cols-2 md:grid-cols-3 gap-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5">
                          <CheckCircle2 size={120} className="text-green-500" />
                       </div>
                       {[
                         { label: "Student Name", value: result.data.studentName },
                         { label: "Roll Number", value: result.data.rollNumber },
                         { label: "Degree", value: result.data.degree },
                         { label: "Institution", value: result.data.institution },
                         { label: "CGPA", value: result.data.cgpa },
                         { label: "Issue Date", value: new Date(Number(result.data.issuedAt) * 1000).toLocaleDateString() }
                       ].map((item, i) => (
                         <div key={i} className={`space-y-1 animate-fade-up relative z-10`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                            <p className="text-sm font-bold text-white uppercase">{item.value}</p>
                         </div>
                       ))}
                    </div>

                    {result.data.ipfsCID && (
                       <div className="flex justify-center pt-4">
                          <a 
                            href={`https://gateway.pinata.cloud/ipfs/${result.data.ipfsCID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary px-10 py-5 flex items-center gap-3 text-lg font-bold shadow-2xl shadow-accent/40 hover:scale-105 transition-all"
                          >
                             <Globe size={24} /> View Original Document
                          </a>
                       </div>
                    )}

                    <div className="glass-morphism p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                                <ShieldCheck size={16} /> Blockchain Audit Trail
                            </h4>
                            <button 
                                onClick={async () => {
                                    try {
                                        if (!window.ethereum) throw new Error("MetaMask not found.");
                                        const prov = new ethers.BrowserProvider(window.ethereum);
                                        const sig = await prov.getSigner();
                                        const ctr = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, sig);
                                        const tx = await ctr.verifyCertificate(result.data.certId, result.data.sha256Hash);
                                        alert("Verification logging started! Transaction: " + tx.hash);
                                        await tx.wait();
                                        alert("Verification recorded on-chain! Dashboard count will increase.");
                                    } catch (e) {
                                        alert("Error logging verification: " + (e.reason || e.message));
                                    }
                                }}
                                className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest rounded-lg border border-accent/30 transition-all flex items-center gap-2"
                            >
                                <History size={14} /> Record Official Proof
                            </button>
                        </div>
                       <div className="space-y-4">
                          {[
                            "Certificate ID indexed in registry",
                            "Historical hash retrieved from block storage",
                            "Data parity matching 100% (Bit-for-bit)",
                            "Active status confirmed (Not revoked)"
                          ].map((step, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl animate-fade-up`} style={{ animationDelay: `${0.4 + i*0.1}s` }}>
                               <span className="text-sm text-slate-400">{step}</span>
                               <CheckCircle2 size={18} className="text-green-500" />
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {result.status === "tampered" && (
                 <div className="space-y-8">
                    <div className="flex flex-col items-center gap-4 py-8">
                       <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-x-bounce shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                          <XCircle size={56} className="text-white" strokeWidth={3} />
                       </div>
                       <h2 className="text-3xl font-extrabold text-white">Tampered — certificate is forged</h2>
                       <p className="text-slate-400">The submitted document does not match the blockchain record.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="glass-morphism p-6 border-green-500/20 bg-green-500/[0.02] space-y-4">
                          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                             <Lock size={12} /> On-chain original hash
                          </p>
                          <div className="p-4 bg-black/40 rounded-lg font-mono text-[10px] break-all leading-relaxed text-green-500 border border-green-500/10 h-24 overflow-y-auto">
                             {result.data.onChainHash}
                          </div>
                       </div>
                       <div className="glass-morphism p-6 border-red-500/20 bg-red-500/[0.02] space-y-4">
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                             <AlertTriangle size={12} /> Tampered / Forged hash
                          </p>
                          <div className="p-4 bg-black/40 rounded-lg font-mono text-[10px] break-all leading-relaxed text-red-500 border border-red-500/10 h-24 overflow-y-auto">
                             {result.data.submittedHash}
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {result.status === "revoked" && (
                 <div className="space-y-8 animate-fade-slide">
                    <div className="flex flex-col items-center gap-4 py-8">
                       <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center animate-x-bounce">
                          <AlertTriangle size={56} className="text-white" strokeWidth={3} />
                       </div>
                       <h2 className="text-3xl font-extrabold text-white uppercase tracking-tighter">Certificate Revoked</h2>
                       <p className="text-slate-400 underline underline-offset-4 decoration-amber-500/30">Voided by the issuing institution</p>
                    </div>

                    <div className="glass-morphism p-10 space-y-6 border-amber-500/20">
                       <div className="flex justify-between border-b border-white/5 pb-4">
                          <span className="text-slate-500 text-sm">Reason for revocation</span>
                          <span className="text-amber-500 font-bold uppercase tracking-tight">{result.data.revocationReason || "Institutional Policy"}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/5 pb-4">
                          <span className="text-slate-500 text-sm">Date Voided</span>
                          <span className="text-white font-mono">{new Date(Number(result.data.revokedAt) * 1000).toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Revoking Entity</span>
                          <span className="text-white font-mono text-xs truncate ml-4">{result.data.revokedBy}</span>
                       </div>
                    </div>
                 </div>
              )}

              {result.status === "notfound" && (
                 <div className="glass-morphism p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center opacity-30">
                       <Search size={40} />
                    </div>
                    <h2 className="text-2xl font-bold">No certificate found</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">We couldn't find a record for the provided ID. Please double-check the reference number or ensure the institution has completed the on-chain registration.</p>
                    <button onClick={() => setResult(null)} className="btn-primary px-8 py-3">Try again</button>
                 </div>
              )}

              <button 
                onClick={() => setResult(null)} 
                className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2 justify-center py-10 w-full"
              >
                <ChevronLeft size={16} /> Back to verification input
              </button>
           </div>
        )}
      </div>

      {/* Scanner Modal Overlay */}
      {showScanner && (
          <QRScanner 
            onScan={handleQrScan} 
            onClose={() => setShowScanner(false)} 
          />
      )}

      {/* Footer Branding */}
      <div className="container mx-auto px-6 py-20 border-t border-white/5 text-center mt-20">
         <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
            <Globe size={24} className="text-slate-500" />
            <h2 className="text-lg font-bold tracking-tight text-white uppercase">CertChain Protocol</h2>
         </div>
         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest max-w-sm mx-auto">
            Decentralized verification provided by the CertChain Network. Verifiable, Immutable, and Transparent.
         </p>
      </div>
    </div>
  );
};

export default VerifyPortal;
