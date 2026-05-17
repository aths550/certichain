import React, { useState, useEffect, useRef, useCallback } from "react";

import { ethers } from "ethers";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  ShieldAlert, 
  Users, 
  UserCircle, 
  Upload, 
  FileText, 
  QrCode, 
  Eye, 
  Loader2,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  MoreVertical,
  Activity,
  RefreshCcw
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { CONTRACT_ADDRESS, CONTRACT_ABI, getPublicProvider, getContract } from "../utils/contract";
import Sidebar from "../components/Sidebar";
import CollegeTable from "../components/CollegeTable";
import QuickIssueModal from "../components/QuickIssueModal";
import CredentialViewModal from "../components/CredentialViewModal";

// --- Sub-components ---

const DiagnosticPanel = ({ stats }) => (
  <div className="mt-20 p-8 glass-morphism border-blue-500/20 bg-blue-500/[0.02] rounded-3xl animate-fade-up">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <Activity size={18} className="text-blue-400" />
      </div>
      <div>
        <h3 className="font-bold text-white tracking-tight">System Diagnostics</h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Network & Protocol Health</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Registry Contract</p>
        <p className="text-xs font-mono text-blue-400 break-all">{CONTRACT_ADDRESS}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Consensus Height</p>
        <p className="text-xs font-mono text-white">Block #{stats.blockNumber}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Indexer Status</p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-mono text-white">Direct-Chain Active</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <p className="text-[10px] text-accent uppercase tracking-widest font-bold">QR Health Check</p>
           <div className={`px-2 py-0.5 rounded text-[8px] font-bold ${import.meta.env.VITE_PUBLIC_URL ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
              {import.meta.env.VITE_PUBLIC_URL ? 'PUBLIC MODE' : 'LOCAL MODE'}
           </div>
        </div>
        <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
           <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Active QR Base</p>
           <p className="text-[10px] font-mono text-white truncate">{import.meta.env.VITE_PUBLIC_URL || window.location.origin}</p>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, colorClass, delay, onClick, subLabel }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (typeof value === "number") {
      let start = 0;
      const step = value / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <div 
      onClick={onClick}
      className={`glass-morphism p-6 border-slate-800 animate-fade-up ${delay} cursor-pointer group hover:bg-white/[0.04] hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${colorClass}`}>
          <Icon size={20} className="text-white" />
        </div>
        <MoreVertical className="text-slate-600 group-hover:text-slate-400" size={16} />
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
            {typeof value === "number" ? displayValue.toLocaleString() : value}
          </h3>
          {subLabel && (
            <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 animate-fade-in whitespace-nowrap">
              {subLabel}
            </span>
          )}
        </div>
      </div>
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-accent/[0.05] transition-colors" />
    </div>
  );
};


const BarChart = () => {
  const data = [
    { month: "Dec", value: "55%" },
    { month: "Jan", value: "70%" },
    { month: "Feb", value: "45%" },
    { month: "Mar", value: "85%" },
    { month: "Apr", value: "100%" },
  ];

  return (
    <div className="glass-morphism p-8 border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Monthly Issuance</h4>
        <span className="text-[10px] text-accent font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">+12% vs LY</span>
      </div>
      <div className="flex-1 flex items-end justify-between gap-4 px-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="relative w-full bg-slate-800/50 rounded-lg h-40 overflow-hidden">
               <div 
                  className="absolute bottom-0 left-0 w-full bg-accent animate-bar-grow" 
                  style={{ "--target-width": "100%", height: item.value }}
                />
            </div>
            <span className="text-xs text-slate-500 font-medium">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Main Dashboard ---

const AdminDashboard = ({ account }) => {
  const { colleges, isAdmin, currentUser } = useAuth();
  const [data, setData] = useState({
    total: 0,
    globalTotal: 0,
    verifications: 0,
    revoked: 0,
    certificates: [],
    loading: true,
    blockNumber: 0,
    gasPrice: "21",
    flashBlock: false
  });
  const navigate = useNavigate();

  // --- Quick Issue State ---
  const [quickIssueFile, setQuickIssueFile] = useState(null);
  const [quickIssueMetadata, setQuickIssueMetadata] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueStatus, setIssueStatus] = useState({ type: "", message: "" });

  const [selectedCert, setSelectedCert] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalMode, setViewModalMode] = useState("view");


  const runManualFallback = useCallback(async (provider, contract, totalIssued, ids) => {
      try {
          const auditLog = await contract.getGlobalAuditLog();
          const last5Ids = ids.slice(-5);
          const detailResults = await Promise.allSettled(last5Ids.map(id => contract.getCertificateDetails(id)));
          
          const allCertDetails = detailResults
            .filter(r => r.status === "fulfilled")
            .map(r => ({
              certId: r.value.certId,
              studentName: r.value.studentName,
              rollNumber: r.value.rollNumber,
              degree: r.value.degree,
              cgpa: r.value.cgpa,
              isRevoked: r.value.isRevoked,
              institution: r.value.institution,
              sha256Hash: r.value.sha256Hash,
              ipfsCID: r.value.ipfsCID,
              issuedAt: Number(r.value.issuedAt)
            }));

          let counts = { 
            globalIssued: totalIssued, 
            issued: totalIssued, 
            verified: auditLog.length + totalIssued, // Start with total issued as base verifications
            revoked: 0 
          };
          
          if (currentUser?.role === "collegeAdmin" && currentUser.collegeName) {
              const myInst = currentUser.collegeName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
              const scanIds = ids.slice(-100); 
              const scanRes = await Promise.allSettled(scanIds.map(id => contract.getCertificateDetails(id)));
              
              const myCerts = scanRes
                .filter(r => r.status === "fulfilled")
                .map(r => r.value)
                .filter(c => c.institution.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === myInst);
                
              const myCertIds = new Set(myCerts.map(c => c.certId));
              counts = { 
                globalIssued: totalIssued,
                issued: myCerts.length, 
                verified: auditLog.filter(log => myCertIds.has(log.certId)).length + myCerts.length, 
                revoked: myCerts.filter(c => c.isRevoked).length 
              };
          } else {
              counts.revoked = allCertDetails.filter(c => c.isRevoked).length;
          }

          setData(prev => ({
              ...prev,
              globalTotal: counts.globalIssued,
              total: counts.issued,
              verifications: counts.verified,
              revoked: counts.revoked,
              certificates: allCertDetails.reverse(),
              loading: false
          }));
      } catch (e) {
          console.error("Manual fallback failed", e);
          setData(prev => ({ ...prev, loading: false }));
      }
  }, [currentUser]);

  const fetchData = useCallback(async () => {
    let currentProvider, currentContract;
    try {
      currentProvider = await getPublicProvider();
      currentContract = await getContract(currentProvider);
      
      const liveBlock = await currentProvider.getBlockNumber();
      const ids = await currentContract.getAllCertificateIds();
      const liveTotal = await currentContract.getTotalCertificates();

      // Ensure block is set early
      setData(prev => ({ ...prev, blockNumber: Number(liveBlock), globalTotal: Number(liveTotal) }));

      // 1. Try Backend API
      let stats;
      try {
          const statsRes = await axios.get("/api/stats");
          stats = statsRes.data;
      } catch (apiErr) {
          console.warn("API unavailable, falling back to manual scan.");
          await runManualFallback(currentProvider, currentContract, Number(liveTotal), ids);
          return;
      }

      // LOGIC: If relevant live blockchain is ahead of API, use the live data.
      if (Number(liveTotal) > stats.global.issued) {
          console.warn("Smart Sync: Live chain is ahead of API. Prioritizing blockchain.");
          await runManualFallback(currentProvider, currentContract, Number(liveTotal), ids);
          return;
      }

      // Standard Path (API is in sync)
      const last5Ids = ids.slice(-5);
      const results = await Promise.allSettled(last5Ids.map(id => currentContract.getCertificateDetails(id)));
      const allCertDetails = results
        .filter(r => r.status === "fulfilled")
        .map(r => ({
          certId: r.value.certId,
          studentName: r.value.studentName,
          rollNumber: r.value.rollNumber,
          degree: r.value.degree,
          cgpa: r.value.cgpa,
          isRevoked: r.value.isRevoked,
          institution: r.value.institution,
          sha256Hash: r.value.sha256Hash,
          ipfsCID: r.value.ipfsCID,
          issuedAt: Number(r.value.issuedAt)
        }));

      let displayStats = stats.global;
      if (currentUser?.role === "collegeAdmin" && currentUser.collegeName) {
          displayStats = stats.byInstitution[currentUser.collegeName] || { issued: 0, verified: 0, revoked: 0 };
      }

      setData(prev => ({
        ...prev,
        globalTotal: Number(liveTotal),
        total: displayStats.issued,
        verifications: displayStats.verified + displayStats.issued, // Combined metric
        revoked: displayStats.revoked,
        certificates: allCertDetails.reverse(),
        loading: false
      }));
    } catch (err) {
      console.warn("Critical fetch error, using direct fallback", err);
      if (currentProvider && currentContract) {
          const liveTotal = await currentContract.getTotalCertificates();
          const ids = await currentContract.getAllCertificateIds();
          await runManualFallback(currentProvider, currentContract, Number(liveTotal), ids);
      } else {
          setData(prev => ({ ...prev, loading: false }));
      }
    }
  }, [currentUser, runManualFallback]);


  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(fetchData, 8000); 
    
    const blockInterval = setInterval(async () => {
      try {
        const provider = await getPublicProvider();
        const block = await provider.getBlockNumber();
        setData(prev => ({
          ...prev, 
          blockNumber: Number(block),
          flashBlock: Number(block) !== prev.blockNumber
        }));
        setTimeout(() => setData(prev => ({ ...prev, flashBlock: false })), 1000);
      } catch {}
    }, 5000);

    // 4. Live Event Listener for real-time updates
    let listenerContract;
    const subscribeToEvents = async () => {
        try {
            const provider = await getPublicProvider();
            listenerContract = await getContract(provider);
            listenerContract.on("CertificateIssued", (id) => {
                console.log(`Live Event: Certificate ${id} issued. Syncing...`);
                fetchData();
            });
            listenerContract.on("CertificateVerified", (id) => {
                console.log(`Live Event: Certificate ${id} verified. Syncing metrics...`);
                fetchData();
            });
        } catch (e) {
            console.warn("Could not set up live event listeners:", e);
        }
    };
    subscribeToEvents();

    return () => {
        clearInterval(refreshInterval);
        clearInterval(blockInterval);
        if (listenerContract) {
            listenerContract.removeAllListeners("CertificateIssued");
        }
    };

  }, [fetchData]);

  // --- Quick Issue Logic ---
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setQuickIssueFile(file);
    setIssueStatus({ type: "loading", message: "Analyzing file..." });

    if (file.type === "application/json") {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        setQuickIssueMetadata(json);
        setIsModalOpen(true);
      } catch (e) {
        setIssueStatus({ type: "error", message: "Invalid JSON format" });
      }
    } else {
      // PDF or other
      setQuickIssueMetadata({
        studentName: "",
        rollNumber: "",
        degree: "B.Tech CS",
        cgpa: "",
        institution: currentUser?.collegeName || ""
      });
      setIsModalOpen(true);
    }
  }, [currentUser]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const handleProcessIssue = async (metadata) => {
    if (!account) {
      setIssueStatus({ type: "error", message: "Please connect your wallet first." });
      return;
    }

    setIsIssuing(true);
    setIssueStatus({ type: "loading", message: "1/3: Pinning to IPFS..." });

    try {
      // 1. IPFS Upload
      const formData = new FormData();
      formData.append("file", quickIssueFile);
      const ipfsRes = await axios.post("/api/ipfs", formData, {
        headers: { "x-wallet-address": account }
      });
      const ipfsCID = ipfsRes.data.ipfsCID;

      // 2. SHA-256 Hashing
      setIssueStatus({ type: "loading", message: "2/3: Computing hash..." });
      const hashRes = await axios.post("/api/hash", formData);
      const fileHash = "0x" + hashRes.data.hash;

      // 3. Blockchain Transaction
      setIssueStatus({ type: "loading", message: "3/3: Awaiting MetaMask..." });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.issueCertificate(
        metadata.certId || `CERT-${Date.now()}`,
        fileHash,
        ipfsCID,
        account,
        metadata.studentName,
        metadata.rollNumber,
        metadata.degree,
        metadata.institution,
        metadata.cgpa
      );

      setIssueStatus({ type: "loading", message: "Finalizing on-chain..." });
      await tx.wait();

      setIssueStatus({ type: "success", message: "Certificate issued successfully!" });
      setIsModalOpen(false);
      fetchData(); // Refresh dashboard
      
      // Clear status after 5s
      setTimeout(() => setIssueStatus({ type: "", message: "" }), 5000);
    } catch (err) {
      console.error(err);
      setIssueStatus({ 
        type: "error", 
        message: err.reason || err.response?.data?.error || err.message || "Failed to issue certificate." 
      });
    } finally {
      setIsIssuing(false);
    }
  };



  return (
    <div className="bg-[#051120] min-h-screen text-slate-200">
      <Sidebar />
      
      <main className="ml-[75px] p-10 space-y-10 transition-all duration-300">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-3">
               Admin dashboard
               <span className={`text-[10px] px-2 py-0.5 rounded border ${isAdmin ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} uppercase tracking-widest font-bold`}>
                 {isAdmin ? "Super Admin" : "College Admin"}
               </span>
            </h1>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-blink" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Blockchain connected</span>
               </div>
               <span className="text-slate-700">•</span>
               <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Sepolia</span>
               <span className="text-slate-700">•</span>
               <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                 Gas: <span className="text-slate-300 font-mono tracking-tighter">{data.gasPrice} Gwei</span>
               </span>
               <span className="text-slate-700">•</span>
               <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-500 ${data.flashBlock ? 'text-yellow-400' : 'text-slate-500'}`}>
                 Block: <span className="font-mono tracking-tighter">{data.blockNumber}</span>
               </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setData(prev => ({ ...prev, loading: true }));
                fetchData();
              }}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
              title="Force blockchain re-index"
            >
              <RefreshCcw size={14} className={`${data.loading ? 'animate-spin text-accent' : ''}`} />
              Manual Sync
            </button>
            <Link to="/issue" className="btn-primary bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 px-6 py-3 text-sm flex items-center gap-2">
              <PlusCircle size={18} /> Issue new certificate
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Issued" 
            value={data.globalTotal} 
            icon={FileText} 
            colorClass="bg-blue-600/20 text-blue-400" 
            delay="delay-0"
            onClick={() => document.getElementById('recent-credentials')?.scrollIntoView({ behavior: 'smooth' })}
            subLabel={currentUser?.role === "collegeAdmin" ? `Your Institution: ${data.total}` : null}
          />
          <StatCard 
            label="On-chain Success" 
            value={data.successRate} 
            icon={CheckCircle2} 
            colorClass="bg-green-600/20 text-green-400" 
            delay="delay-[50ms]" 
            onClick={() => navigate('/audit')}
          />
          <StatCard 
            label="Verifications" 
            value={data.verifications} 
            icon={Zap} 
            colorClass="bg-amber-600/20 text-amber-400" 
            delay="delay-[100ms]" 
            onClick={() => navigate('/audit')}
          />
          <StatCard 
            label="Revoked" 
            value={data.revoked} 
            icon={ShieldAlert} 
            colorClass="bg-red-600/20 text-red-400" 
            delay="delay-[150ms]" 
            onClick={() => navigate('/revocations')}
          />
        </div>



        {/* Issuance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-96">
          <div 
            {...getRootProps()}
            className={`glass-morphism p-12 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all group overflow-hidden relative ${
              isDragActive ? "border-accent bg-accent/5 ring-4 ring-accent/10" : "border-slate-800 hover:border-accent/40 hover:bg-accent/[0.02]"
            }`}
          >
            <input {...getInputProps()} />
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {issueStatus.type === "loading" ? (
              <div className="flex flex-col items-center gap-4 relative z-10">
                <Loader2 size={40} className="text-accent animate-spin" />
                <p className="text-sm font-bold text-white uppercase tracking-widest">{issueStatus.message}</p>
              </div>
            ) : issueStatus.type === "success" ? (
              <div className="flex flex-col items-center gap-4 relative z-10 animate-bounce-slow">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <p className="text-sm font-bold text-green-500 uppercase tracking-widest">{issueStatus.message}</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                  <Upload className="text-slate-400 group-hover:text-accent" size={32} />
                </div>
                <h4 className="text-xl font-bold mb-2 relative z-10">Drop certificate PDF or JSON here</h4>
                <p className="text-sm text-slate-500 relative z-10 max-w-xs">Auto-generates SHA-256 hash → IPFS → Ethereum record record in one flow.</p>
                {issueStatus.type === "error" && (
                  <p className="mt-4 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 relative z-10">
                    {issueStatus.message}
                  </p>
                )}
              </>
            )}
          </div>
          <BarChart />
        </div>

        {/* Embedded SuperAdmin College Manager */}
        {isAdmin && (
            <CollegeTable />
        )}


        {/* Table Section */}
        <div id="recent-credentials" className="glass-morphism border-slate-800 overflow-hidden mt-10">

          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent credentials</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-accent hover:underline">View all records</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-8 py-4">Student Name</th>
                  <th className="px-8 py-4">Roll No.</th>
                  <th className="px-8 py-4">Degree</th>
                  <th className="px-8 py-4">CGPA</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="h-4 bg-slate-800 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : data.certificates.length > 0 ? (
                  data.certificates.map((cert, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors animate-row-fade" style={{ animationDelay: `${i * 80}ms` }}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden relative shimmer-sweep">
                              <FileText size={16} className="text-slate-400" />
                           </div>
                           <span className="text-sm font-medium text-white">{cert.studentName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs text-slate-400 tracking-tighter">{cert.rollNumber}</td>
                      <td className="px-8 py-6 text-sm">{cert.degree}</td>
                      <td className="px-8 py-6 text-sm">{cert.cgpa}</td>
                      <td className="px-8 py-6">
                         {cert.isRevoked ? (
                           <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Revoked</span>
                         ) : (
                           <span className="bg-green-500/10 text-green-500 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Verified</span>
                         )}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedCert(cert);
                                setViewModalMode("qr");
                                setViewModalOpen(true);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                               <QrCode size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedCert(cert);
                                setViewModalMode("view");
                                setViewModalOpen(true);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                               <Eye size={18} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <FileText size={40} className="opacity-20" />
                        <p className="text-sm font-medium">No recent credentials found on-chain</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">New issuances will appear here instantly</p>
                      </div>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* Blockchain Status Bar */}
        <div className="flex items-center justify-between px-2 pt-10 text-[10px] text-slate-600 font-mono tracking-tighter uppercase font-bold">
           <div className="flex items-center gap-4">
              <span>Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
              <span className="text-slate-800">|</span>
              <span>Last block: {data.blockNumber}</span>
              <span className="text-slate-800">|</span>
              <span>MetaMask connected</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,1)] animate-pulse" />
              <span>Full node sync</span>
           </div>
        </div>
        <DiagnosticPanel stats={data} />
      </main>

      <QuickIssueModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={quickIssueMetadata}
        onConfirm={handleProcessIssue}
        loading={isIssuing}
      />

      <CredentialViewModal 
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        certificate={selectedCert}
        mode={viewModalMode}
      />
    </div>
  );
};


export default AdminDashboard;
