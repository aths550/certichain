import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { 
  History, 
  Terminal, 
  Code2, 
  Shield, 
  Zap, 
  Database, 
  Search, 
  Clock, 
  Globe, 
  Activity,
  FileCode2,
  Lock,
  UserCheck,
  Building,
  ChevronRight,
  Info
} from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const AuditTrail = () => {
  const { isLoggedIn } = useAuth();
  const [stats, setStats] = useState({ totalCerts: 0, totalColleges: 0, totalVerifications: 0 });
  const [events, setEvents] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [certAudit, setCertAudit] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Live Stats Polling
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        const total = await contract.getTotalCertificates();
        const auditLog = await contract.getGlobalAuditLog();
        // Mocking college count as the contract doesn't have a direct getTotalColleges but we can infer or hardcode
        setStats({
          totalCerts: Number(total),
          totalColleges: 12,
          totalVerifications: auditLog.length
        });
      } catch (err) {
        console.error("Stats error:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Real-time Event Listeners
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const handleEvent = (type, certId, extra, timestamp) => {
      const newEvent = { type, certId, extra, timestamp: Date.now() / 1000 };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    };

    contract.on("CertificateIssued", (certId, issuer, student) => handleEvent("Issued", certId, student));
    contract.on("CertificateVerified", (certId, verifier, result) => handleEvent("Verified", certId, verifier));
    contract.on("CertificateRevoked", (certId, revokedBy, reason) => handleEvent("Revoked", certId, reason));

    // Fetch initial logs
    contract.getGlobalAuditLog().then(logs => {
       const mapped = logs.slice(-20).reverse().map(l => ({
          type: "Verified",
          certId: l.certId,
          extra: l.verifier,
          timestamp: Number(l.timestamp)
       }));
       setEvents(mapped);
    });

    return () => {
      contract.removeAllListeners();
    };
  }, []);

  const handleSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const trail = await contract.getAuditTrail(searchId);
      setCertAudit(trail);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#051120] min-h-screen text-slate-200 flex">
      {isLoggedIn && <Sidebar />}
      <main className={`flex-1 pb-20 transition-all duration-300 ${isLoggedIn ? 'ml-[75px]' : ''}`}>
      {/* Stats Bar */}
      <div className="bg-primary/20 border-b border-white/5 py-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="container mx-auto px-6 grid grid-cols-3 gap-8">
           <div className="flex items-center gap-3 animate-fade-up">
              <FileCode2 className="text-accent" size={20} />
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Records Registered</p>
                 <p className="text-sm font-bold text-white">{stats.totalCerts.toLocaleString()} TOTAL</p>
              </div>
           </div>
           <div className="flex items-center gap-3 animate-fade-up delay-100 border-x border-white/5 px-8">
              <Building className="text-amber-500" size={20} />
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Nodes Active</p>
                 <p className="text-sm font-bold text-white">{stats.totalColleges} COLLEGES</p>
              </div>
           </div>
           <div className="flex items-center gap-3 animate-fade-up delay-200">
              <UserCheck className="text-green-500" size={20} />
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Audit Checks</p>
                 <p className="text-sm font-bold text-white">{stats.totalVerifications.toLocaleString()} VERIFICATIONS</p>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Contract Function Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <Terminal className="text-accent" size={24} />
                 <h2 className="text-2xl font-bold tracking-tight">Contract Reference</h2>
              </div>
              <div className="glass-morphism p-2 space-y-1">
                 {[
                   { name: "issueCertificate()", type: "write", color: "text-amber-400 bg-amber-400/10", desc: "Register a new student certificate on-chain." },
                   { name: "verifyCertificate()", type: "read", color: "text-blue-400 bg-blue-400/10", desc: "Cross-reference data parity and log audit entry." },
                   { name: "revokeCertificate()", type: "admin", color: "text-red-400 bg-red-400/10", desc: "Void an existing record with institutional reason." },
                   { name: "grantRole()", type: "admin", color: "text-red-400 bg-red-400/10", desc: "Manage access control lists for administrators." },
                   { name: "CertificateIssued", type: "event", color: "text-green-400 bg-green-400/10", desc: "Emitted when a new record is mined." }
                 ].map((func, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] rounded-xl transition-all group animate-fade-up" style={{ animationDelay: `${i*50}ms` }}>
                       <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-white/5 ${func.color}`}>{func.type}</span>
                       <div className="flex-1">
                          <p className="text-xs font-mono font-bold text-white group-hover:text-accent transition-colors">{func.name}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{func.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <Code2 className="text-accent" size={24} />
                 <h2 className="text-2xl font-bold tracking-tight">Struct Definitions</h2>
              </div>
              <div className="glass-morphism h-[320px] overflow-hidden flex flex-col">
                 <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Solidity 0.8.20</span>
                    <Lock size={12} className="text-slate-600" />
                 </div>
                 <div className="flex-1 p-6 font-mono text-xs sol-bg overflow-y-auto leading-relaxed">
                    <p><span className="sol-keyword">struct</span> <span className="sol-type">Certificate</span> <span className="sol-punct">{"{"}</span></p>
                    <p className="pl-6"><span className="sol-type">string</span> certId<span className="sol-punct">;</span></p>
                    <p className="pl-6"><span className="sol-type">string</span> sha256Hash<span className="sol-punct">;</span></p>
                    <p className="pl-6"><span className="sol-type">string</span> ipfsCID<span className="sol-punct">;</span></p>
                    <p className="pl-6"><span className="sol-type">address</span> issuerAddress<span className="sol-punct">;</span></p>
                    <p className="pl-6"><span className="sol-type">address</span> studentAddress<span className="sol-punct">;</span></p>
                    <p className="pl-6"><span className="sol-type">string</span> studentName<span className="sol-punct">;</span></p>
                    <p className="pl-6"><span className="sol-type">uint256</span> issuedAt<span className="sol-punct">;</span> <span className="sol-comment">// EPOCH TIME</span></p>
                    <p className="pl-6"><span className="sol-type">bool</span> isRevoked<span className="sol-punct">;</span></p>
                    <p className="sol-punct">{"}"}</p>
                 </div>
              </div>
              <div className="glass-morphism p-6 space-y-4">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} className="text-amber-500" /> RBAC Policy Matrix
                 </h4>
                 <div className="space-y-2">
                    {[
                      { role: "Super Admin", access: "Full management of colleges & roles" },
                      { role: "College Admin", access: "Issue certificates & manage audit logs" },
                      { role: "Student / Verifier", access: "Read-only access to relevant records" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-white/5 rounded">
                         <span className="font-bold text-white w-24">{row.role}</span>
                         <span className="text-slate-500 italic">{row.access}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Live Event Feed */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Activity className="text-accent" size={24} />
                 <h2 className="text-2xl font-bold tracking-tight">Live blockchain events</h2>
                 <div className="bg-red-500/10 text-red-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1.5 ml-2">
                    <div className="w-1 h-1 rounded-full bg-red-500 animate-blink-red" />
                    LIVE
                 </div>
              </div>
              <p className="text-xs text-slate-500 font-mono">Syncing w/ block height: 3.2M+</p>
           </div>
           
           <div className="glass-morphism h-[400px] overflow-hidden relative">
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050912] to-transparent z-10 pointer-events-none" />
              <div className="overflow-y-auto h-full p-2 space-y-1">
                 {events.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 gap-3">
                       <Database size={24} className="animate-spin" />
                       <span className="text-sm font-bold uppercase tracking-widest">Awaiting event stream...</span>
                    </div>
                 ) : events.map((event, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-2xl transition-all animate-event-slide">
                       <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                         event.type === 'Issued' ? 'bg-green-500' : event.type === 'Verified' ? 'bg-blue-500' : 'bg-red-500'
                       }`} />
                       <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                          <span className="text-sm font-bold text-white">{event.type}</span>
                          <span className="text-xs font-mono text-slate-400 truncate">{event.certId}</span>
                          <span className="text-[11px] text-slate-500 truncate font-mono">
                             {typeof event.extra === 'string' ? `${event.extra.slice(0, 10)}...` : 'Institutional Check'}
                          </span>
                          <span className="text-right text-[10px] text-slate-600 font-bold uppercase">
                             {new Date(event.timestamp * 1000).toLocaleTimeString()}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Certificate Level Audit */}
        <div className="glass-morphism p-10 space-y-10">
           <div className="max-w-xl">
              <h2 className="text-2xl font-bold mb-2">Certificate Forensics</h2>
              <p className="text-slate-400 mb-6">Enter a certificate ID to fetch its complete verification history and audit trail.</p>
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                       value={searchId}
                       onChange={(e) => setSearchId(e.target.value)}
                       className="input-field w-full pl-12" 
                       placeholder="Enter CERT-ID..." 
                    />
                 </div>
                 <button onClick={handleSearch} className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center gap-2">
                    {loading ? <Zap size={18} className="animate-spin" /> : "Inspect"}
                 </button>
              </div>
           </div>

           {certAudit && (
              <div className="space-y-6 animate-fade-slide">
                 <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">{certAudit.length} verifications for {searchId}</h4>
                    <div className="h-px bg-white/5 flex-1 mx-8" />
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                       <thead>
                          <tr className="text-slate-600 uppercase font-bold tracking-widest">
                             <th className="px-4 py-2 bg-white/5 rounded-l-lg">Timestamp</th>
                             <th className="px-4 py-2 bg-white/5">Verifier Node</th>
                             <th className="px-4 py-2 bg-white/5">Result</th>
                             <th className="px-4 py-2 bg-white/5 rounded-r-lg">Submitted Hash</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {certAudit.map((entry, i) => (
                             <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-4 text-slate-400">{new Date(Number(entry.timestamp) * 1000).toLocaleString()}</td>
                                <td className="px-4 py-4">
                                   <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold">Node</div>
                                      <span className="font-mono text-[10px] text-slate-500">Verifier #{String(entry.verifier).slice(-4)}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-4">
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                     entry.result === 0 ? "text-green-500 bg-green-500/10 border border-green-500/20" : "text-red-500 bg-red-500/10 border border-red-500/20"
                                   }`}>
                                      {entry.result === 0 ? "VALID" : "TAMPERED"}
                                   </span>
                                </td>
                                <td className="px-4 py-4 font-mono text-slate-600 truncate max-w-xs">{entry.submittedHash}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}
        </div>
      </div>
      </main>
    </div>
  );
};

export default AuditTrail;
