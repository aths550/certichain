import React, { useEffect, useState } from "react";
import { X, ExternalLink, ShieldCheck, Download, Calendar, GraduationCap, ClipboardList, Hash, Database, QrCode } from "lucide-react";
import QRCode from "qrcode";
import CertificateTemplate from "./CertificateTemplate";

const CredentialViewModal = ({ isOpen, onClose, certificate, mode = "view" }) => {
  const [qrUrl, setQrUrl] = useState("");
  const [activeTab, setActiveTab] = useState(mode);

  useEffect(() => {
    if (certificate && isOpen) {
      const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
      const verifyUrl = `${baseUrl}/verify?id=${certificate.certId}`;
      QRCode.toDataURL(verifyUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      }).then(setQrUrl).catch(console.error);
      setActiveTab(mode);
    }
  }, [certificate, isOpen, mode]);

  if (!isOpen || !certificate) return null;

  // Safety: Ensure fields exist to prevent crash
  const safeCert = {
    ...certificate,
    studentName: certificate.studentName || "Unknown Student",
    degree: certificate.degree || "N/A",
    rollNumber: certificate.rollNumber || "N/A",
    issuedAt: certificate.issuedAt ? Number(certificate.issuedAt) : Date.now() / 1000,
  };

  const detailItem = (icon, label, value, isMono = false) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-500">
        {React.createElement(icon, { size: 12 })}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-sm ${isMono ? "font-mono text-xs text-accent" : "font-medium text-white"}`}>
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#08101C] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-fade-up my-auto">
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab("view")}
              className={`pb-1 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "view" ? "text-accent" : "text-slate-500 hover:text-slate-300"}`}
            >
              Details & Preview
              {activeTab === "view" && <div className="absolute -bottom-7 left-0 right-0 h-1 bg-accent rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab("qr")}
              className={`pb-1 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "qr" ? "text-accent" : "text-slate-500 hover:text-slate-300"}`}
            >
              QR Code
              {activeTab === "qr" && <div className="absolute -bottom-7 left-0 right-0 h-1 bg-accent rounded-full" />}
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all transform hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-10">
          {activeTab === "view" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left: Details */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{safeCert.studentName}</h3>
                  <p className="text-accent text-xs font-bold uppercase tracking-widest">{safeCert.degree}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                    {detailItem(ClipboardList, "Roll Number", safeCert.rollNumber)}
                    {detailItem(Calendar, "Issued Date", new Date(safeCert.issuedAt * 1000).toLocaleDateString())}
                    {detailItem(Hash, "SHA-256 Hash", safeCert.sha256Hash?.slice(0, 16) + "...", true)}
                    {detailItem(Database, "IPFS CID", safeCert.ipfsCID?.slice(0, 16) + "...", true)}
                    {detailItem(ShieldCheck, "Status", safeCert.isRevoked ? "REVOKED" : "VERIFIED")}
                </div>

                <div className="flex flex-col gap-3">
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${safeCert.ipfsCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-300 transition-all border border-white/5"
                  >
                    View Original File <ExternalLink size={14} />
                  </a>
                  <a 
                    href={qrUrl}
                    download={`${safeCert.certId}_Certificate.pdf`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-accent/20 hover:bg-accent/30 rounded-2xl text-xs font-bold uppercase tracking-widest text-accent transition-all border border-accent/20"
                  >
                    Download Certificate PDF <Download size={14} />
                  </a>
                </div>
              </div>

              {/* Right: Template Preview */}
              <div className="lg:col-span-2 overflow-hidden rounded-[32px] border border-white/10 shadow-2xl bg-[#0D1117] relative group">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                 <div className="scale-[0.6] sm:scale-[0.8] origin-top">
                   <CertificateTemplate certData={safeCert} />
                 </div>
                <div className="absolute inset-x-0 bottom-0 py-4 bg-black/60 backdrop-blur-md text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] border-t border-white/5">
                  Institutional Blockchain Credential Preview
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in">
              <div className="relative">
                <div className="absolute -inset-8 bg-accent/20 blur-[60px] rounded-full animate-pulse" />
                <div className="relative p-8 bg-white rounded-[40px] shadow-2xl shadow-accent/20">
                   {qrUrl ? (
                     <img src={qrUrl} alt="Certificate QR" className="w-64 h-64" />
                   ) : (
                     <div className="w-64 h-64 flex items-center justify-center bg-slate-100">
                        <QrCode className="animate-spin text-slate-300" size={48} />
                     </div>
                   )}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-white">Universal Verification QR</h4>
                <p className="text-slate-500 text-sm max-w-xs">Scan this code to verify authenticity instantly on the public portal.</p>
              </div>

              <div className="flex gap-4">
                 <button className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-300 border border-white/10 transition-all">
                   Copy Verification Link
                 </button>
                 <a 
                   href={qrUrl} 
                   download={`${certificate.certId}_QR.png`}
                   className="px-8 py-3 bg-accent hover:bg-accent/90 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-accent/20 transition-all"
                 >
                   Download QR Image
                 </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CredentialViewModal;
