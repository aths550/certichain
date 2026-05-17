import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Globe, ShieldCheck, Star, Award, CheckCircle2, Download, Mail } from "lucide-react";
import QRCode from "qrcode";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";
import { formatHash } from "../utils/web3Utils";

const CertificateTemplate = ({ certData, txHash }) => {
  const [qrBase64, setQrBase64] = useState("");

  useEffect(() => {
    if (certData && certData.certId) {
      // Build a verification URL - uses VITE_PUBLIC_URL in production, falls back to current origin
      const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
      const params = new URLSearchParams({
        id: certData.certId,
        hash: certData.sha256Hash || "",
        name: certData.studentName || "",
        roll: certData.rollNumber || "",
        degree: certData.degree || ""
      });
      const verifyUrl = `${baseUrl}/verify?${params.toString()}`;
      
      QRCode.toDataURL(verifyUrl, {
        width: 400,
        margin: 1,
        color: {
          dark: "#0F172A",
          light: "#ffffff"
        }
      }).then(setQrBase64).catch(console.error);
    }
  }, [certData]);

  if (!certData) return (
    <div className="flex items-center justify-center h-full text-slate-500 font-bold uppercase tracking-widest text-xs">
       Loading Certificate Data...
    </div>
  );

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    generateCertificatePDF(certData, txHash);
  };

  const InstitutionSeal = () => {
    const initial = certData.institution ? certData.institution.charAt(0).toUpperCase() : "C";
    return (
      <svg width="80" height="80" viewBox="0 0 100 100" className="text-white">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M50 15 L53 25 L63 25 L55 32 L58 42 L50 36 L42 42 L45 32 L37 25 L47 25 Z" fill="currentColor" />
        <text x="50" y="58" fontSize="18" fontWeight="black" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'serif' }}>{initial}</text>
        <text x="50" y="68" fontSize="5" textAnchor="middle" fill="currentColor" tracking="widest uppercase">OFFICIAL SEAL</text>
        <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    );
  };

  const CornerOrnament = ({ className }) => (
    <svg width="40" height="40" viewBox="0 0 40 40" className={className}>
      <path d="M0 0 L40 0 L40 2 L2 2 L2 40 L0 40 Z" fill="#BA7517" />
      <circle cx="5" cy="5" r="2" fill="#BA7517" />
    </svg>
  );

  const SignatureCurve = () => (
    <svg width="120" height="40" viewBox="0 0 120 40" className="text-slate-400 opacity-60">
      <path d="M10 30 Q 30 10, 60 30 T 110 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const WatermarkLogo = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
       <div className="relative w-[500px] h-[500px] border-[20px] border-[#0F172A] rounded-full flex items-center justify-center">
          <InstitutionSeal />
          <div className="absolute inset-0 border-[1px] border-dashed border-[#0F172A] rounded-full scale-110" />
       </div>
    </div>
  );

  const displayDate = certData.issuedAt 
    ? new Date(Number(certData.issuedAt) * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : "N/A";

  return (
    <div className="flex flex-col items-center gap-12 w-full animate-fade-in py-10">
      {/* Visual Preview */}
      <div className="relative w-full max-w-[1000px] aspect-[1.414/1] bg-white text-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden rounded-sm border-[16px] border-[#0F172A] p-1">
        
        {/* Inner Gold Line */}
        <div className="absolute inset-1 border-[1px] border-[#BA7517] pointer-events-none z-10" />
        
        {/* Corner Ornaments */}
        <div className="absolute top-2 left-2 z-20">
          <CornerOrnament className="" />
        </div>
        <div className="absolute top-2 right-2 z-20 rotate-90">
          <CornerOrnament className="" />
        </div>
        <div className="absolute bottom-2 left-2 z-20 -rotate-90">
          <CornerOrnament className="" />
        </div>
        <div className="absolute bottom-2 right-2 z-20 rotate-180">
          <CornerOrnament className="" />
        </div>

        <WatermarkLogo />

        {/* Header Bar */}
        <div className="relative bg-[#0F172A] px-12 py-8 flex justify-between items-center text-white">
           <div className="flex items-center gap-8">
              <InstitutionSeal />
              <div className="space-y-1">
                 <h2 className="text-3xl font-bold tracking-tight uppercase font-serif">{certData.institution || "INSTITUTION NAME"}</h2>
                 <div className="space-y-0.5">
                    <p className="text-xs font-medium text-amber-400">Affiliated to State University • AICTE Approved</p>
                    <p className="text-[10px] text-slate-400 tracking-wider">Government Recognized • ISO 9001:2015 Certified</p>
                 </div>
              </div>
           </div>
           <div className="bg-white/5 border border-white/20 p-4 rounded-xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
              <Star className="text-amber-400" size={20} fill="#fbbf24" />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400">CertChain</p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Verified</p>
           </div>
        </div>

        {/* Body */}
        <div className="relative px-20 pt-10 text-center flex flex-col h-full bg-[radial-gradient(circle_at_center,rgba(186,117,23,0.02)_0%,transparent_70%)]">
           <div className="flex items-center justify-center gap-6 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent to-[#BA7517] flex-1" />
              <div className="flex items-center gap-3">
                 <Star size={14} className="text-[#BA7517]" fill="#BA7517" />
                 <h3 className="text-2xl font-serif font-bold text-[#0F172A] tracking-[0.2em] uppercase">Certificate of Completion</h3>
                 <Star size={14} className="text-[#BA7517]" fill="#BA7517" />
              </div>
              <div className="h-px bg-gradient-to-l from-transparent to-[#BA7517] flex-1" />
           </div>

           <p className="text-sm font-medium italic text-slate-500 mb-6">This is to certify that</p>
           
           <div className="relative inline-block mx-auto mb-10 group">
              <h1 className="text-6xl font-black text-[#0F172A] uppercase tracking-tight font-serif drop-shadow-sm px-4">
                {certData.studentName || "STUDENT NAME"}
              </h1>
              <div className="absolute -bottom-4 left-0 h-1.5 bg-[#BA7517] rounded-full animate-gold-grow origin-left shadow-sm" />
           </div>

           <div className="space-y-6">
              <p className="text-base text-slate-600 font-medium">
                having Roll Number <span className="text-[#0F172A] font-bold font-mono px-1.5">{certData.rollNumber || "N/A"}</span> has successfully completed all requirements for the degree of
              </p>
              <h4 className="text-4xl font-bold text-blue-800 tracking-tight leading-snug max-w-3xl mx-auto uppercase">
                {certData.degree || "DEGREE NAME"}
              </h4>
              <p className="text-lg font-medium text-slate-800">
                with CGPA <span className="text-[#0F172A] font-black text-2xl px-2 underline decoration-[#BA7517] underline-offset-4">{certData.cgpa || "0.0"} / 10.0</span>
              </p>
           </div>

           <div className="mt-auto mb-16 grid grid-cols-3 gap-12 px-10">
              <div className="flex flex-col items-center">
                 <SignatureCurve />
                 <div className="w-full h-px bg-slate-300 mb-2" />
                 <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Controller of Examinations</p>
                 <p className="text-[8px] text-slate-500 uppercase">{certData.institution}</p>
              </div>
              <div className="flex flex-col items-center justify-end">
                 <p className="text-sm font-bold text-[#0F172A] mb-1">{displayDate}</p>
                 <div className="w-full h-px bg-slate-300 mb-2" />
                 <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Issue Date</p>
                 <p className="text-[8px] text-slate-500 uppercase">Academic Year 2024–25</p>
              </div>
              <div className="flex flex-col items-center">
                 <SignatureCurve />
                 <div className="w-full h-px bg-slate-300 mb-2" />
                 <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Principal & Dean</p>
                 <p className="text-[8px] text-slate-500 uppercase">{certData.institution}</p>
              </div>
           </div>

           <div className="absolute bottom-16 right-16 flex items-end gap-12 group">
              <div className="text-right space-y-3">
                 <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">On-Chain Certificate ID</p>
                    <p className="text-sm font-black text-[#0F172A] font-mono tracking-tighter break-all">{certData.certId}</p>
                 </div>
                  <div className="space-y-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <p className="text-[8px] font-mono text-slate-500 leading-tight">
                      AUTHENTICITY HASH: <br/>
                      <span className="text-[#0F172A] break-all">{certData.sha256Hash}</span>
                    </p>
                    <p className="text-[8px] font-mono text-slate-500 leading-tight">
                      STORAGE CID: <br/>
                      <span className="text-[#0F172A] break-all">{certData.ipfsCID}</span>
                    </p>
                  </div>
                 <div className="flex items-center gap-1.5 justify-end bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">On-chain verified</span>
                 </div>
              </div>
              <div className="bg-white p-2 rounded-xl border-2 border-[#0F172A] shadow-md transition-transform hover:scale-110">
                 {qrBase64 ? (
                    <img src={qrBase64} alt="Verify" className="w-24 h-24" />
                 ) : (
                    <div className="w-24 h-24 bg-slate-50 animate-pulse border border-slate-100" />
                 )}
                 <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest text-center mt-1">Scan to verify</p>
              </div>
           </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#0F172A] flex justify-between items-center px-10 border-t border-[#BA7517]/30 z-20">
           <div className="flex items-center gap-2 text-white">
              <Star size={10} className="text-amber-400" fill="#fbbf24" />
              <p className="text-[9px] font-bold uppercase tracking-widest">CertChain • Blockchain Verified</p>
           </div>
           <div className="text-[7px] font-mono text-white/40 flex items-center gap-3">
              <span className="truncate max-w-[150px]">Tx: {txHash || "0x00...00"}</span>
              <span className="h-3 w-px bg-white/20" />
              <span className="tracking-widest uppercase">Ethereum • IPFS • Sepolia</span>
           </div>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-[800px]">
         <button 
           onClick={handleDownload}
           className="flex-[2] bg-[#0F172A] text-white hover:bg-slate-900 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1 active:scale-95 border border-white/10"
         >
            <Download size={20} className="text-amber-400" /> Download PDF
         </button>
                <a 
                  href="https://wa.me/919503981129"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 transition-all border border-white/5"
                >
                  <Mail size={14} /> Contact Institution
                </a>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gold-grow {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-gold-grow {
          animation: gold-grow 1.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default CertificateTemplate;
