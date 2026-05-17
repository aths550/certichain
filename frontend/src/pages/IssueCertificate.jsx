import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ethers } from "ethers";
import axios from "axios";
import { 
  Check, 
  ChevronRight, 
  Upload, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Download, 
  RefreshCcw,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  Eye,
  X
} from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";
import CertificateTemplate from "../components/CertificateTemplate";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const steps = [
  { id: 1, name: "Enter metadata" },
  { id: 2, name: "Upload to IPFS" },
  { id: 3, name: "Generate hash" },
  { id: 4, name: "Sign & publish" },
  { id: 5, name: "Finalize & Preview" },
];

const IssueCertificate = ({ account }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    degree: "B.Tech CS",
    cgpa: "",
    issueDate: new Date().toISOString().split("T")[0],
    institution: currentUser?.collegeName || "MIT College of Engineering",
    certId: `CERT-${Date.now()}`
  });
  const [file, setFile] = useState(null);
  const [ipfsCID, setIpfsCID] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [txDetails, setTxDetails] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, progress: 0, msg: "" });
  const [scrambledHash, setScrambledHash] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Step 1: Metadata Logic
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const validateStep1 = () => {
    return formData.studentName && formData.rollNumber && formData.cgpa && formData.institution;
  };

  // Step 2: IPFS Logic
  const onDrop = (acceptedFiles) => setFile(acceptedFiles[0]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10485760 // 10MB
  });

  const handleUploadToIPFS = async () => {
    if (!file) return;
    setStatus({ loading: true, error: null, progress: 0, msg: "Pinning to IPFS..." });
    
    const interval = setInterval(() => {
      setStatus(prev => ({ ...prev, progress: Math.min(prev.progress + Math.random() * 5, 95) }));
    }, 200);

    try {
      const data = new FormData();
      data.append("file", file);
      const res = await axios.post("/api/ipfs", data, {
          headers: { 'wallet-address': account }
      });
      
      clearInterval(interval);
      setStatus({ loading: false, error: null, progress: 100 });
      setIpfsCID(res.data.ipfsCID);
      setTimeout(() => setCurrentStep(3), 800);
    } catch (err) {
      clearInterval(interval);
      setStatus({ 
        loading: false, 
        error: err.response?.data?.error || err.message || "Failed to upload to IPFS.", 
        progress: 0 
      });
    }
  };

  // Step 3: Hashing Scramble Logic
  useEffect(() => {
    if (currentStep === 3) {
      handleGenerateHash();
    }
  }, [currentStep]);

  const handleGenerateHash = async () => {
    setStatus({ loading: true, error: null });
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await axios.post("/api/hash", data);
      const realHash = res.data.hash;
      
      let iterations = 0;
      const chars = "0123456789ABCDEF";
      const scrambleInterval = setInterval(() => {
        let currentScramble = "";
        for (let i = 0; i < 64; i++) {
          if (i < iterations * 2) {
            currentScramble += realHash[i];
          } else {
            currentScramble += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        setScrambledHash(currentScramble);
        iterations++;
        if (iterations > 32) {
          clearInterval(scrambleInterval);
          setFileHash(realHash);
          setStatus({ loading: false });
        }
      }, 40);
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.error || err.message || "Hashing failed." });
    }
  };

  // Step 4: Signing Logic
  const handleSignAndPublish = async () => {
    if (!account) return setStatus({ ...status, error: "Wallet not connected." });
    setStatus({ loading: true, error: null, msg: "Awaiting MetaMask confirmation..." });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.issueCertificate(
        formData.certId,
        "0x" + fileHash,
        ipfsCID,
        account, 
        formData.studentName,
        formData.rollNumber,
        formData.degree,
        formData.institution,
        formData.cgpa
      );

      setStatus({ loading: true, msg: "Transaction submitted — waiting for block confirmation..." });
      const receipt = await tx.wait();
      
      setTxDetails({
        hash: receipt.hash,
        block: receipt.blockNumber,
        certId: formData.certId
      });
      setCurrentStep(5);
    } catch (err) {
      setStatus({ 
        loading: false, 
        error: err.reason || err.message || "Transaction rejected or account unauthorized." 
      });
    }
  };

  const certificateData = {
    ...formData,
    sha256Hash: fileHash,
    ipfsCID: ipfsCID,
    issuedAt: Math.floor(Date.now() / 1000)
  };

  return (
    <div className="bg-[#051120] min-h-screen text-slate-200">
      <Sidebar />
      <main className="ml-[75px] transition-all duration-300 p-10">
        <div className="flex flex-col md:flex-row gap-12 min-h-[80vh]">
          {/* Sidebar Stepper */}
          <div className="w-full md:w-[240px] flex-shrink-0 space-y-8">
        <div className="flex flex-col gap-6">
          {steps.map((step, i) => (
            <div key={step.id} className="relative flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10 transition-all duration-300 ${
                currentStep > step.id ? "bg-green-500 text-white" : 
                currentStep === step.id ? "bg-accent text-white shadow-[0_0_15px_rgba(24,95,165,0.4)]" : 
                "bg-slate-800 text-slate-500 border border-slate-700"
              }`}>
                {currentStep > step.id ? <Check size={20} /> : step.id}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-widest ${
                  currentStep >= step.id ? "text-slate-300" : "text-slate-600"
                }`}>Step {step.id}</span>
                <span className={`text-sm font-medium ${
                  currentStep === step.id ? "text-accent" : 
                  currentStep > step.id ? "text-green-500" : "text-slate-500"
                }`}>{step.name}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`absolute left-5 top-10 w-0.5 h-10 -ml-px ${
                  currentStep > step.id ? "bg-green-500" : "bg-slate-800"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl">
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-slide">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">Enter metadata</h2>
              <p className="text-slate-400">Provide the academic credentials for this blockchain record.</p>
            </div>
            <div className="glass-morphism p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Student Name</label>
                  <input name="studentName" value={formData.studentName} onChange={handleInputChange} className="input-field w-full" placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Roll Number</label>
                  <input name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="input-field w-full" placeholder="e.g. 2024CS01" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Degree</label>
                  <input name="degree" value={formData.degree} onChange={handleInputChange} className="input-field w-full" placeholder="e.g. Master of Science" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">CGPA</label>
                  <input name="cgpa" type="number" step="0.01" value={formData.cgpa} onChange={handleInputChange} className="input-field w-full" placeholder="e.g. 9.5" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Institution Name</label>
                  <input 
                    name="institution" 
                    value={formData.institution} 
                    onChange={handleInputChange} 
                    className="input-field w-full bg-white/5 opacity-70 cursor-not-allowed" 
                    placeholder="Enter Exact College Name" 
                    readOnly 
                  />
                </div>

              </div>
              <button 
                onClick={() => validateStep1() ? setCurrentStep(2) : setStatus({ ...status, error: "Please fill all fields." })}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                Next Step <ChevronRight size={18} />
              </button>
              {status.error && <p className="text-red-500 text-xs text-center font-bold tracking-tight">{status.error}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-slide">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Upload to IPFS</h2>
                <p className="text-slate-400">Store the original document on the decentralized web.</p>
            </div>
            
            <div {...getRootProps()} className={`border-2 border-dashed rounded-[32px] p-20 transition-all duration-300 cursor-pointer ${
              isDragActive ? "border-accent bg-accent/5" : "border-slate-800 hover:border-slate-700 bg-white/[0.02]"
            }`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                  <Upload size={40} className={file ? "text-accent" : "text-slate-500"} />
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / (1024*1024)).toFixed(2)} MB • PDF Document</p>
                  </div>
                ) : (
                  <div className="text-center">
                     <p className="text-white font-bold mb-1">Drag & drop certificate</p>
                     <p className="text-slate-500 text-sm">PDF, JPEG, or PNG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {status.loading && (
              <div className="space-y-3 px-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   <span>{status.msg}</span>
                   <span>{Math.round(status.progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-accent transition-all duration-300" style={{ width: `${status.progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-4">
               <button onClick={() => setCurrentStep(1)} className="px-8 py-4 border border-slate-800 rounded-2xl hover:bg-white/5 transition-colors flex items-center gap-2 font-bold text-slate-400">
                  <ChevronLeft size={18} /> Back
               </button>
               <button 
                  disabled={!file || status.loading}
                  onClick={handleUploadToIPFS}
                  className="btn-primary flex-1 py-4 font-bold text-lg"
               >
                  {status.loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Upload"}
               </button>
            </div>
            {status.error && <p className="text-red-500 text-xs text-center font-bold tracking-tight">{status.error}</p>}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8 animate-fade-slide">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">Generate hash</h2>
              <p className="text-slate-400">Computing the unique cryptographic fingerprint.</p>
            </div>

            <div className="glass-morphism p-8 space-y-6">
              <div className="p-8 bg-black/40 rounded-2xl border border-white/5 font-mono text-sm break-all leading-relaxed relative overflow-hidden min-h-[120px] flex items-center text-center">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
                <span className={fileHash ? "text-green-500" : "text-accent/60"}>
                  {scrambledHash || "Preparing hashing engine..."}
                </span>
                {status.loading && <Loader2 size={16} className="animate-spin ml-4 text-accent" />}
              </div>

              <div className="p-4 bg-slate-800/30 rounded-xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <Zap size={14} className="text-accent" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">IPFS Reference</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">{ipfsCID}</span>
              </div>

              <button 
                disabled={!fileHash || status.loading}
                onClick={() => setCurrentStep(4)}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
              >
                Proceed to Blockchain Signing <ChevronRight size={18} />
              </button>
              {status.error && <p className="text-red-500 text-xs text-center font-bold tracking-tight">{status.error}</p>}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8 animate-fade-slide">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">Sign & publish</h2>
              <p className="text-slate-400">Authorize the transaction to register the record on-chain.</p>
            </div>

            <div className="glass-morphism p-10 border-amber-500/20 bg-amber-500/[0.03] space-y-8">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                     <ShieldCheck className="text-amber-500" size={28} />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">Awaiting Institutional Signature</p>
                     <p className="text-xs text-slate-500 mt-1">Transaction: registry.issueCertificate()</p>
                  </div>
               </div>

               <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500">Student</span>
                     <span className="font-bold text-white uppercase">{formData.studentName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500">Internal ID</span>
                     <span className="font-mono text-xs text-accent">{formData.certId}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                     <span className="text-slate-500">Estimated Gas</span>
                     <span className="text-green-500 font-bold tracking-tighter">0.0004 ETH (~$1.20)</span>
                  </div>
               </div>

               {status.loading ? (
                 <div className="bg-slate-900/80 p-6 rounded-2xl flex items-center gap-4 border border-white/5 shadow-2xl">
                    <Loader2 size={24} className="animate-spin text-accent" />
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{status.msg}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network status: Broadcasting</p>
                    </div>
                 </div>
               ) : (
                 <button onClick={handleSignAndPublish} className="btn-primary w-full py-4 bg-[#BA7517] hover:bg-[#A66714] text-white shadow-[0_0_30px_rgba(186,117,23,0.3)]">
                    Confirm & Publish on Sepolia
                 </button>
               )}

               {status.error && (
                 <div className="flex items-center gap-3 bg-red-500/10 p-4 rounded-xl text-red-500 text-xs font-bold">
                    <AlertCircle size={18} /> {status.error}
                 </div>
               )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-12 animate-fade-slide">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-bounce-slow">
                   <Check size={48} className="text-white" strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">SUCCESSFULLY ISSUED</h2>
                <p className="text-slate-400 max-w-sm mx-auto">The certificate is now a permanent part of the Ethereum ledger.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button 
                    onClick={() => setShowPreview(true)}
                    className="glass-morphism p-6 flex items-center justify-center gap-4 hover:bg-white/5 transition-all group"
                 >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Eye className="text-accent" size={24} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Interactive</p>
                        <p className="text-lg font-bold text-white">View Preview</p>
                    </div>
                 </button>
                 <button 
                    onClick={() => generateCertificatePDF(certificateData, txDetails?.hash)}
                    className="glass-morphism p-6 flex items-center justify-center gap-4 hover:bg-white/5 transition-all group"
                 >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download className="text-primary" size={24} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Offline Copy</p>
                        <p className="text-lg font-bold text-white">Download PDF</p>
                    </div>
                 </button>
             </div>

             <div className="glass-morphism p-8 space-y-4 bg-black/40 border-white/5">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">TX Hash</span>
                    <span className="font-mono text-[10px] text-accent">{txDetails?.hash.slice(0, 16)}...{txDetails?.hash.slice(-16)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Block Number</span>
                    <span className="text-sm font-bold text-green-500"># {txDetails?.block}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5 flex gap-4">
                    <a 
                        href={`https://sepolia.etherscan.io/tx/${txDetails?.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        View on Etherscan <ExternalLink size={12} />
                    </a>
                    <button 
                        onClick={() => window.location.reload()}
                        className="flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        Issue New <RefreshCcw size={12} />
                    </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Preview Modal Overlay */}
      {showPreview && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
             <div className="w-full max-w-5xl relative mt-20 mb-20 animate-fade-in">
                <button 
                    onClick={() => setShowPreview(false)}
                    className="absolute -top-16 right-0 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:rotate-90 shadow-xl"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="bg-[#0D1117] border border-white/5 rounded-[40px] p-8 md:p-14 shadow-2xl">
                    <div className="mb-12 text-center space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">CertChain Preview System</p>
                        <h2 className="text-3xl font-extrabold text-white">Official Credential Mockup</h2>
                    </div>
                    <CertificateTemplate certData={certificateData} txHash={txDetails?.hash} />
                </div>
             </div>
          </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default IssueCertificate;
