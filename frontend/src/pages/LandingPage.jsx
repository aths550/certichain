import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ChevronRight, 
  UploadCloud, 
  UserCheck, 
  Zap, 
  Globe, 
  ArrowRight,
  Shield,
  Check,
  LayoutDashboard,
  LogIn,
  GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";

// --- Sub-components ---

const StatPill = ({ label, target, delay, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.6, ease: "easeOut" }}
      className={`glass-morphism px-5 py-3 flex items-center gap-3 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform`}
    >
      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${color}`} />
      <span className="text-sm font-medium text-slate-300">
        <span className="text-white font-bold text-lg">{count.toLocaleString()}</span> {label}
      </span>
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, colorClass, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.6 }}
  >
    <Link to={to || "#"} className="glass-morphism p-8 border border-white/5 hover:border-white/20 hover:-translate-y-2 transition-all duration-300 group block rounded-3xl relative overflow-hidden h-full bg-gradient-to-b from-white/[0.03] to-transparent">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colorClass}`}>
        <Icon size={28} className="text-white" />
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-base text-slate-400 leading-relaxed font-light">{desc}</p>
    </Link>
  </motion.div>
);

const StepCard = ({ number, title, desc, isLast }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="flex gap-8 items-start relative group"
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 group-hover:border-blue-400 flex items-center justify-center font-bold text-blue-400 bg-slate-900 z-10 shadow-lg shadow-blue-500/20 transition-colors">
          {number}
        </div>
        {!isLast && <div className="w-px h-32 bg-gradient-to-b from-blue-500/30 to-transparent my-2" />}
      </div>
      <div className="pt-2 pb-12">
        <h4 className="text-xl font-semibold mb-3 text-white">{title}</h4>
        <p className="text-base text-slate-400 max-w-md leading-relaxed font-light">{desc}</p>
      </div>
    </motion.div>
  );
};

// --- Main Page ---

const LandingPage = () => {
  const { isLoggedIn, isAdmin, colleges } = useAuth();
  const [stats, setStats] = useState({ totalCerts: 0, totalVerifications: 0, totalColleges: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/stats");
        const { global, byInstitution } = res.data;
        
        const institutionCount = Object.keys(byInstitution || {}).length;
        setStats({
          totalCerts: global.issued,
          totalVerifications: global.verified,
          totalColleges: Math.max(institutionCount, colleges?.length || 0)
        });
      } catch (err) {
        console.warn("Backend stats unavailable, falling back to direct chain fetching", err);
        try {
          const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          const total = await contract.getTotalCertificates();
          const auditLog = await contract.getGlobalAuditLog();
          setStats({
            totalCerts: Number(total),
            totalVerifications: auditLog.length,
            totalColleges: colleges?.length || 0
          });
        } catch (chainErr) {
          console.error("Chain fallback failed:", chainErr);
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [colleges]);

  return (
    <div className="bg-[#0a0f1c] text-white selection:bg-blue-500/30 selection:text-white min-h-screen overflow-hidden font-sans">
      
      {/* Background Orbs for a softer, humanised aesthetic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 pt-20">
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-10 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-400" />
              <span className="text-xs font-semibold tracking-wide text-slate-200">CERTCHAIN NETWORK</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-medium text-emerald-400">Systems Online</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 max-w-5xl leading-[1.05]"
          >
            Your achievements, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-semibold">secured forever.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-14 leading-relaxed font-light"
          >
            We empower students and institutions by transforming traditional academic credentials into verifiable, lifelong digital assets.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 mb-20 w-full sm:w-auto"
          >
            {isLoggedIn ? (
              <Link to="/admin" className="btn-primary bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/50 px-8 py-4 flex items-center justify-center gap-3 rounded-2xl text-lg w-full sm:w-auto">
                <LayoutDashboard size={20} />
                {isAdmin ? "Admin Dashboard" : "College Dashboard"}
              </Link>
            ) : (
              <Link to="/login" className="btn-primary bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/50 px-8 py-4 flex items-center justify-center gap-3 rounded-2xl text-lg w-full sm:w-auto">
                Issue Credentials <ChevronRight size={20} />
              </Link>
            )}
            <Link to="/verify" className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg font-medium w-full sm:w-auto">
              <ShieldCheck size={20} className="text-slate-400" />
              Verify a Certificate
            </Link>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl">
            <StatPill label="Credentials Issued" target={stats.totalCerts} delay={0.4} color="bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
            <StatPill label="Successful Verifications" target={stats.totalVerifications} delay={0.5} color="bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <StatPill label="Partner Institutions" target={stats.totalColleges} delay={0.6} color="bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-semibold mb-6">Designed for everyone.</h2>
          <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto">Whether you're a university issuing thousands of degrees or a student sharing a single achievement, our platform makes it effortless.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            delay={0.1}
            icon={GraduationCap} 
            title="For Institutions" 
            desc="Batch issue tamper-proof certificates with a single click. Reduce administrative overhead and eliminate credential fraud." 
            colorClass="bg-blue-500/20 text-blue-400 shadow-blue-500/20"
            to="/issue"
          />
          <FeatureCard 
            delay={0.2}
            icon={UserCheck} 
            title="For Students" 
            desc="Access your lifelong digital wallet. Share your verifiable achievements directly with employers via a simple QR code or link." 
            colorClass="bg-purple-500/20 text-purple-400 shadow-purple-500/20"
            to="/portal"
          />
          <FeatureCard 
            delay={0.3}
            icon={ShieldCheck} 
            title="For Employers" 
            desc="Verify any candidate's credentials instantly and confidently without relying on costly third-party background checks." 
            colorClass="bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20"
            to="/verify"
          />
        </div>
      </section>

      {/* How It Works - Humanized approach */}
      <section className="container mx-auto px-6 py-32 relative z-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-semibold mb-6 leading-tight">Simple process, <br /><span className="text-slate-400">powerful technology.</span></h2>
              <p className="text-slate-400 text-lg font-light">We hide the complexity of blockchain technology behind a beautiful, intuitive interface so you can focus on what matters most.</p>
            </motion.div>

            <div className="space-y-2">
              <StepCard 
                number="1" 
                title="Upload & Secure" 
                desc="Institutions upload standard PDF certificates. We automatically secure them with cryptographic signatures."
              />
              <StepCard 
                number="2" 
                title="Permanent Record" 
                desc="The achievement is permanently recorded on a decentralized network, ensuring it can never be lost or altered."
              />
              <StepCard 
                number="3" 
                title="Instant Proof" 
                desc="Anyone can scan the embedded QR code to instantly verify the certificate's authenticity against the public record."
                isLast={true}
              />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 w-full relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl rounded-[3rem]" />
            <div className="glass-morphism rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative bg-slate-900/80 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400" />
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ShieldCheck size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-white">Verification Success</h5>
                    <p className="text-xs text-slate-400">Just now</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                  Authentic
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse" />
                <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse delay-75" />
                <div className="h-4 w-5/6 bg-white/5 rounded-full animate-pulse delay-150" />
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Globe size={24} className="text-purple-400" />
                </div>
                <div>
                  <h6 className="text-sm font-medium text-slate-200">Secured on Ethereum</h6>
                  <p className="text-xs text-slate-400 mt-1">Transaction confirmed by 12 network nodes</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
