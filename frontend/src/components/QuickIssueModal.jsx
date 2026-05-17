import React, { useState } from "react";
import { X, ShieldCheck, User, GraduationCap, School, Calculator, ClipboardList, Loader2 } from "lucide-react";

const QuickIssueModal = ({ isOpen, onClose, initialData, onConfirm, loading }) => {
  const [formData, setFormData] = useState({
    studentName: initialData?.studentName || "",
    rollNumber: initialData?.rollNumber || "",
    degree: initialData?.degree || "B.Tech CS",
    cgpa: initialData?.cgpa || "",
    institution: initialData?.institution || "",
    certId: `CERT-${Date.now()}`
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-[#0D1525] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="text-accent" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Finalize Credentials</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Verify data before on-chain signing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Student Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-accent/50 outline-none transition-all"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Roll Number</label>
              <div className="relative">
                <ClipboardList size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-accent/50 outline-none transition-all"
                  placeholder="e.g. 2024CS01"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">CGPA</label>
              <div className="relative">
                <Calculator size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  type="number"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-accent/50 outline-none transition-all"
                  placeholder="e.g. 9.5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Degree</label>
              <div className="relative">
                <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  value={formData.degree}
                  onChange={(e) => setFormData({...formData, degree: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-accent/50 outline-none transition-all"
                  placeholder="e.g. B.Tech"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Institution</label>
              <div className="relative">
                <School size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-accent/50 outline-none transition-all"
                  placeholder="College Name"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>Confirm & Issue Certificate</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickIssueModal;
