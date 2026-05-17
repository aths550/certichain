import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { 
  User, 
  Wallet, 
  FileText, 
  Download, 
  QrCode, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Award,
  Zap,
  Eye,
  X
} from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";
import CertificateTemplate from "../components/CertificateTemplate";
import { useWallet } from "../context/WalletContext";
import { logStudentActivity, useAuth } from "../context/AuthContext";

const CertificateCard = ({ cert, onPreview, username }) => {
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // In a real app, we might want to fetch the actual txHash from the contract events
      // For now, we use a placeholder or the certificate hash as a reference
      await generateCertificatePDF(cert, "0x" + cert.sha256Hash);
      if (username) {
        logStudentActivity(username, "Downloaded Certificate", `Downloaded PDF for ${cert.degree}`);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = () => {
    if (username) {
      logStudentActivity(username, "Viewed Certificate", `Opened preview for ${cert.degree}`);
    }
    onPreview(cert);
  };

  return (
    <div className="glass-morphism border-slate-800 overflow-hidden transition-all duration-300 hover:border-accent/30 group">
      <div className="p-6 flex flex-col md:flex-row items-center gap-6">
        {/* PDF Icon Shimmer */}
        <div className="w-20 h-24 bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 shimmer-sweep">
          <FileText size={40} className="text-slate-600 group-hover:text-accent transition-colors" />
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{cert.degree}</h3>
            <p className="text-sm text-slate-400 mt-1">{cert.institution} • {new Date(Number(cert.issuedAt) * 1000).toLocaleDateString()} • CGPA: {cert.cgpa}</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center">
            <div className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-green-500/20 animate-verified-pop flex items-center gap-1.5">
               <ShieldCheck size={12} /> On-chain verified
            </div>
            <div className="bg-accent/10 text-accent text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-accent/20 flex items-center gap-1.5">
               <Zap size={12} /> Ethereum Sepolia
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
              ID: {cert.certId}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto flex-shrink-0">
          <button 
            onClick={handlePreview}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-white text-primary hover:bg-slate-100 transition-all"
          >
            <Eye size={16} /> View Certificate
          </button>
          
          <button 
            disabled={downloading}
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>

          <a 
            href={`/verify?id=${cert.certId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all uppercase tracking-widest text-[10px]"
          >
            Public Registry <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

const StudentPortal = () => {
  const { currentUser } = useAuth();
  const { account, connectWallet, isConnected, isLoading: walletLoading } = useWallet();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    if (isConnected && account) {
      loadCertificates();
    } else if (!walletLoading) {
      setLoading(false);
    }
  }, [isConnected, account, walletLoading]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const certIds = await contract.getStudentCertificates(account);
      const details = await Promise.all(
        certIds.map(async (id) => await contract.getCertificateDetails(id))
      );
      
      setCertificates(details);
      if (details.length > 0) {
        setStudentInfo({
          name: details[0].studentName,
          roll: details[0].rollNumber,
          institution: details[0].institution
        });
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050912] text-slate-200 pb-20">
      {/* Top Profile Nav */}
      <div className="bg-primary/30 backdrop-blur-xl border-b border-white/5 py-10 mb-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
               <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_rgba(24,95,165,0.3)]">
                 {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User size={32} />}
               </div>
               <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#050912] z-10" />
            </div>
            <div>
               <h1 className="text-3xl font-extrabold text-white tracking-tight">{currentUser?.name || "Student Profile"}</h1>
               <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                  <span className="font-bold flex items-center gap-1"><Award size={14} className="text-accent" /> @{currentUser?.username || "student"}</span>
                  <span className="text-slate-700">•</span>
                  <span>{currentUser?.institution || "Student Account"}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
             <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <Wallet size={16} className="text-slate-500" />
                <span className="text-xs font-mono tracking-tighter text-slate-400 uppercase">
                  {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : "Disconnected"}
                </span>
             </div>
             {isConnected && (
                <div className="flex items-center gap-1.5 px-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live network sync</span>
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl">
        {!isConnected ? (
          <div className="glass-morphism p-20 text-center border-dashed border-2 border-white/10 flex flex-col items-center gap-8">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
               <ShieldCheck size={40} className="text-slate-600" />
            </div>
            <div>
               <h2 className="text-2xl font-bold mb-3 text-white">Connect your wallet to view your credentials</h2>
               <p className="text-slate-400 max-w-sm mx-auto">Access your cryptographically secured academic certificates directly from the blockchain.</p>
            </div>
            <button onClick={connectWallet} className="btn-primary px-10 py-4 flex items-center gap-2 bg-accent shadow-xl shadow-accent/20">
               Connect Provider
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-600">
             <Loader2 size={48} className="animate-spin text-accent" />
             <p className="font-bold uppercase tracking-widest text-[11px]">Syncing academic records...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="glass-morphism p-20 text-center flex flex-col items-center gap-6">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center opacity-40">
                <FileText size={32} />
             </div>
             <h3 className="text-xl font-bold text-white">No certificates issued yet</h3>
             <p className="text-slate-500 max-w-xs mx-auto text-sm">Once your institution registers your degree on CertChain, they'll appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600">My Credentials ({certificates.length})</h3>
               <div className="w-10 h-1 bg-accent/20 rounded-full" />
            </div>
            
            <div className="flex flex-col gap-6">
              {certificates.map((cert, i) => (
                <CertificateCard 
                   key={i} 
                   cert={cert} 
                   onPreview={setPreviewCert} 
                   username={currentUser?.username} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer Info Box */}
        <div className="mt-16 bg-accent/5 border border-accent/10 p-6 rounded-2xl flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Info className="text-accent" size={20} />
           </div>
           <div>
              <p className="text-sm font-medium text-slate-300">Immutability Protocol</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Certificate hashes are permanently recorded on Ethereum and cannot be altered or deleted. This ensures your credentials remain valid and verifiable forever.
              </p>
           </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-5xl relative mt-20 mb-20 animate-fade-in">
            <button 
              onClick={() => setPreviewCert(null)}
              className="absolute -top-12 right-0 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all transform hover:rotate-90"
            >
              <X size={24} />
            </button>
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-4 md:p-12 shadow-2xl">
               <div className="mb-10 text-center">
                  <h2 className="text-2xl font-bold text-white">Certificate Preview</h2>
                  <p className="text-sm text-slate-500">Official digital transcript powered by CertChain Protocol</p>
               </div>
               <CertificateTemplate certData={previewCert} txHash={"0x" + previewCert.sha256Hash} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
