import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { GraduationCap, ExternalLink, ShieldCheck, Clock, Award, Loader2 } from "lucide-react";

export const Profile = ({ account }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      loadCertificates();
    }
  }, [account]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const certIds = await contract.getStudentCertificates(account);
      const certData = await Promise.all(
        certIds.map(async (id) => {
          const details = await contract.getCertificateDetails(id);
          return details;
        })
      );
      
      setCertificates(certData);
    } catch (err) {
      console.error("Error loading certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="glass-morphism p-12 max-w-xl mx-auto border-dashed border-2">
          <Award size={64} className="mx-auto mb-6 text-slate-700" />
          <h2 className="text-2xl font-bold mb-4">No Wallet Connected</h2>
          <p className="text-slate-400 mb-8">Connect your wallet to view your digital credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
          <p className="text-slate-400">Manage and share your blockchain-verified achievements.</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 px-4 py-2 rounded-lg flex items-center gap-2">
          <Award className="text-accent" size={20} />
          <span className="font-bold text-accent">{certificates.length} Credentials</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent mb-4" size={48} />
          <p className="text-slate-400">Fetching your credentials from the blockchain...</p>
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {certificates.map((cert, i) => (
            <div key={i} className="glass-morphism p-8 hover:border-accent/30 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                {cert.isRevoked ? (
                  <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/20">Revoked</span>
                ) : (
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/20 flex items-center gap-1">
                    <ShieldCheck size={12} /> Active
                  </span>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <GraduationCap className="text-accent" size={40} />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-accent transition-colors">{cert.degree}</h3>
                    <p className="text-slate-400 flex items-center gap-2">
                      {cert.institution} • {cert.studentName}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">ID</p>
                      <p className="text-sm font-medium">{cert.certId}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">CGPA</p>
                      <p className="text-sm font-medium">{cert.cgpa}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                    <a 
                       href={`https://ipfs.io/ipfs/${cert.ipfsCID}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-accent flex items-center gap-1 text-sm font-semibold hover:underline"
                    >
                      <ExternalLink size={16} /> View IPFS Copy
                    </a>
                    <div className="flex items-center gap-1 text-slate-500 text-sm ml-auto">
                      <Clock size={16} />
                      {new Date(Number(cert.issuedAt) * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
          <Award size={48} className="mx-auto mb-4 text-slate-700" />
          <h3 className="text-xl font-bold mb-2">No Credentials Found</h3>
          <p className="text-slate-500">You don't have any certificates issued to this address yet.</p>
        </div>
      )}
    </div>
  );
};
