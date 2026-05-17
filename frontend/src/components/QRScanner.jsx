import React, { useState } from "react";
import QrReader from "react-qr-reader-es6";
import jsQR from "jsqr";
import { Camera, Upload, X, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QRScanner = ({ onScan, onClose }) => {
  const [mode, setMode] = useState("camera"); // camera | file
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = (data) => {
    if (data) {
      onScan(data);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            onScan(code.data);
          } else {
            setError("No QR code detected in this image.");
          }
        } catch (err) {
          setError("Failed to process image.");
        } finally {
          setLoading(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="w-full max-w-xl bg-[#0D1117] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white z-10 transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-10 space-y-8">
           <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                 <ShieldCheck className="text-accent" /> Scan Certificate QR
              </h2>
              <p className="text-sm text-slate-500">Hold the certificate QR code up to your camera or upload an image.</p>
           </div>

           <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setMode("camera")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === "camera" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-slate-500 hover:text-white"
                }`}
              >
                <Camera size={18} /> Camera
              </button>
              <button 
                onClick={() => setMode("file")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === "file" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-slate-500 hover:text-white"
                }`}
              >
                <Upload size={18} /> Upload Image
              </button>
           </div>

           <div className="relative aspect-square w-full max-w-[320px] mx-auto overflow-hidden rounded-[24px] border-4 border-slate-800 bg-slate-900 flex items-center justify-center shadow-inner">
              {mode === "camera" ? (
                 <div className="w-full h-full relative">
                    <QrReader 
                       delay={300} 
                       onError={(err) => setError("Camera access denied or failed.")} 
                       onScan={handleScan} 
                       style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
                       <div className="w-full h-full border-2 border-accent/50 animate-pulse relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent" />
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-accent/30 shadow-[0_0_10px_rgba(24,95,165,0.5)] animate-scanline" />
                       </div>
                    </div>
                 </div>
              ) : (
                 <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center gap-4 hover:bg-white/[0.02] transition-all">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {loading ? (
                       <Loader2 className="animate-spin text-accent" size={48} />
                    ) : (
                       <>
                          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                             <Upload size={32} className="text-slate-500" />
                          </div>
                          <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Select certificate image</span>
                       </>
                    )}
                 </label>
              )}
           </div>

           <AnimatePresence>
             {error && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-medium"
               >
                 <AlertCircle size={16} /> {error}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default QRScanner;
