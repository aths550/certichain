import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, User, Mail, Lock, BookOpen, GraduationCap, ChevronRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const StudentRegister = () => {
  const { registerStudent, authError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    rollNumber: "",
    institution: "",
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);

    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 600));

    const result = await registerStudent(form);
    setLoading(false);

    if (result.success) {
      navigate("/login");
    } else {
      setLocalError("Failed to register. Please check your details.");
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-[#050912] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 py-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
             <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
               <ShieldCheck className="text-white" size={26} strokeWidth={2.5} />
             </div>
             <span className="text-2xl font-bold text-white tracking-tight">CertChain</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Student Registration</h1>
          <p className="text-slate-400 text-sm">Create your web3 student identity to access your records</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                 <div className="relative">
                   <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input
                     value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                     placeholder="John Doe" required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                 <div className="relative">
                   <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input
                     type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                     placeholder="john@university.edu" required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Username</label>
                 <div className="relative">
                   <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input
                     value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                     placeholder="johndoe_123" required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                 <div className="relative">
                   <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input
                     type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                     placeholder="Min. 6 characters" required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Roll Number</label>
                 <div className="relative">
                   <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input
                     value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                     placeholder="e.g. CS2022-001" required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Institution Name</label>
                 <div className="relative">
                   <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input
                     value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
                     className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                     placeholder="Current university" required
                   />
                 </div>
               </div>
            </div>

            {displayError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>Register Portfolio <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs mb-4">Already have a student account?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-bold text-sm transition-colors"
            >
              <User size={16} />
              Login to Portal
            </Link>
          </div>
        </div>

        <p className="text-center mt-6 text-slate-600 text-xs">
          <Link to="/" className="hover:text-slate-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentRegister;
