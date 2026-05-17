import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck, Building2, Mail, Lock, User, Eye, EyeOff,
  AlertCircle, CheckCircle2, ChevronRight, MapPin
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CollegeRegister = () => {
  const { registerCollege, authError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name || !form.email || !form.username || !form.password) {
      setLocalError("All fields are required.");
      return false;
    }
    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setLocalError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const result = registerCollege(form);
    setLoading(false);

    if (result.success) {
      setSuccess(result.college);
    } else {
      setLocalError(authError || "Registration failed. Please try again.");
    }
  };

  const displayError = localError || authError;

  if (success) {
    return (
      <div className="min-h-screen bg-[#050912] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md relative z-10 text-center space-y-6">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-bounce">
            <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">College Registered!</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            <span className="text-white font-bold">{success.name}</span> has been successfully registered on CertChain.
          </p>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">College ID</span>
              <span className="text-accent font-mono text-xs">{success.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Username</span>
              <span className="text-white font-bold">{success.username}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Email</span>
              <span className="text-white">{success.email}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
          >
            Proceed to Login <ChevronRight size={18} />
          </button>
          <Link to="/" className="block text-slate-600 hover:text-slate-400 text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050912] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-white" size={26} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">CertChain</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full mb-4">
            <Building2 size={14} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent">College Registration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Register your college</h1>
          <p className="text-slate-400 text-sm">Create an account to start issuing blockchain certificates</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* College Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">College Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                  placeholder="e.g. MIT College of Engineering"
                  required
                />
              </div>
            </div>

            {/* Email & Location row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                    placeholder="admin@college.edu"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                  placeholder="Choose a unique login username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                    placeholder="Min 8 chars"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all text-sm"
                    placeholder="Re-enter password"
                    required
                    autoComplete="new-password"
                  />
                </div>
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
              className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                <>Register College <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:text-accent/80 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-slate-600 text-xs">
          <Link to="/" className="hover:text-slate-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default CollegeRegister;
