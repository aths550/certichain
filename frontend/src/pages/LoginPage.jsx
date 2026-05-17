import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, ChevronRight, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);

    // Simulate brief loading
    await new Promise((r) => setTimeout(r, 600));

    const result = login(form.username.trim(), form.password);
    setLoading(false);

    if (result.success) {
      if (result.role === "superAdmin" || result.role === "collegeAdmin") {
        navigate("/admin");
      } else if (result.role === "student") {
        navigate("/portal");
      }
    } else {
      setLocalError("Invalid username or password. Please try again.");
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-[#050912] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-white" size={26} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">CertChain</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                {displayError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-4">
            <div>
               <p className="text-slate-500 text-xs mb-3">Are you a student?</p>
               <Link
                 to="/register-student"
                 className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-bold text-sm transition-colors"
               >
                 <User size={16} />
                 Create Student Account
               </Link>
            </div>
            <div className="h-px bg-white/5 w-1/2 mx-auto" />
            <div>
               <p className="text-slate-500 text-xs mb-3">Need to register your university?</p>
               <Link
                 to="/register-college"
                 className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm transition-colors"
               >
                 <Building2 size={16} />
                 Register College Account
               </Link>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Demo Credentials</p>
          <p className="text-xs text-slate-500 font-mono">admin / certchain@admin123</p>
        </div>

        <p className="text-center mt-6 text-slate-600 text-xs">
          <Link to="/" className="hover:text-slate-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
