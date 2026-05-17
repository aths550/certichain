import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Building2, PlusCircle, Trash2, Activity, Clock } from "lucide-react";
import axios from "axios";
import { CONTRACT_ADDRESS, CONTRACT_ABI, getPublicProvider, getContract } from "../utils/contract";

const CollegeTable = () => {
  const { colleges, deleteCollege } = useAuth();
  const [collegeStats, setCollegeStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCollegeStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/stats");
        setCollegeStats(res.data.byInstitution || {});
      } catch (err) {
        console.warn("Backend stats unavailable for table, falling back to manual aggregation", err);
        try {
          const provider = await getPublicProvider();
          const contract = await getContract(provider);
          
          const ids = await contract.getAllCertificateIds();
          const auditLog = await contract.getGlobalAuditLog();
          const allDetails = await Promise.all(ids.map(id => contract.getCertificateDetails(id)));

          const stats = {};
          colleges.forEach(college => {
            const myInst = college.name.trim().toLowerCase();
            const myCerts = allDetails.filter(c => c.institution.trim().toLowerCase() === myInst);
            const myCertIds = new Set(myCerts.map(c => c.certId));
            const myVerifications = auditLog.filter(log => myCertIds.has(log.certId));
            
            let lastActive = 0;
            if (myCerts.length > 0) {
              lastActive = Math.max(...myCerts.map(c => Number(c.issuedAt)));
            }
            if (myVerifications.length > 0) {
              const lastVer = Math.max(...myVerifications.map(v => Number(v.timestamp)));
              lastActive = Math.max(lastActive, lastVer);
            }

            stats[college.name] = {
              issued: myCerts.length,
              verified: myVerifications.length,
              lastActive: lastActive
            };
          });
          setCollegeStats(stats);
        } catch (fallbackErr) {
          console.error("College table fallback failed", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeStats();
    const interval = setInterval(fetchCollegeStats, 10000); // Refresh college table stats every 10 seconds
    return () => clearInterval(interval);
  }, [colleges]);


  return (
    <div className="space-y-6 mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight mb-1">Registered Colleges</h2>
          <p className="text-sm text-slate-400">Manage institutions and view their on-chain activity.</p>
        </div>
        <Link to="/register-college" className="btn-primary rounded-xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 px-5 py-2.5 text-sm flex items-center gap-2 transition-all">
          <PlusCircle size={16} /> Register New
        </Link>
      </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-8">
          {colleges.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <Building2 size={40} className="mx-auto mb-4 opacity-50" />
              <p>No colleges registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                    <th className="pb-4">Name / ID</th>
                    <th className="pb-4">Credentials Link</th>
                    <th className="pb-4">Network Operations</th>
                    <th className="pb-4">Latest Activity</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {colleges.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 font-bold text-white flex flex-col gap-1">
                        {c.name}
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{c.id}</span>
                      </td>
                      <td className="py-5">
                          <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">{c.email}</span>
                              <span className="text-[10px] text-slate-400 font-mono">@{c.username}</span>
                          </div>
                      </td>
                      <td className="py-5">
                          {loading ? (
                              <span className="text-slate-500 text-xs animate-pulse">Syncing...</span>
                          ) : (
                              <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-xs">
                                      <Activity size={12} className="text-blue-400" />
                                      <span className="text-slate-300"><strong className="text-white">{collegeStats[c.name]?.issued || 0}</strong> Issued</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                      <span className="text-slate-300"><strong className="text-white">{collegeStats[c.name]?.verified || 0}</strong> Verified</span>
                                  </div>
                              </div>
                          )}
                      </td>
                      <td className="py-5 text-sm text-slate-400 font-mono tracking-tighter">
                          {loading ? "..." : (
                             <div className="flex items-center gap-2">
                                <Clock size={12} className="text-slate-500" />
                                {collegeStats[c.name]?.lastActive 
                                    ? new Date(collegeStats[c.name].lastActive * 1000).toLocaleString() 
                                    : "No activity recorded"}
                             </div>
                          )}
                      </td>
                      <td className="py-5 text-right">
                        <button 
                          onClick={() => {
                            if(window.confirm(`Are you sure you want to completely revoke credentials for ${c.name}?`)) {
                              deleteCollege(c.id);
                            }
                          }}
                          className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
};

export default CollegeTable;
