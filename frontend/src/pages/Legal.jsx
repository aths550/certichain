import React from "react";
import { Scale, ShieldCheck, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LegalPage = () => {
  return (
    <div className="min-h-screen bg-[#051120] text-slate-200 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-accent">
          <ChevronLeft size={16} /> Dashboard
        </Link>

        <div className="space-y-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
             <Scale className="text-purple-400" size={24} />
          </div>
          <h1 className="text-4xl font-black text-white">Legal & Privacy</h1>
          <p className="text-slate-400 font-medium italic underline decoration-purple-500/30">Protocol Version 1.0 (L1-Mainnet Ready)</p>
        </div>

        <div className="glass-morphism p-10 border-white/5 space-y-12 leading-relaxed">
           <section className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                 <ShieldCheck className="text-green-500" size={20} /> Data Privacy Policy
              </h3>
              <p className="text-slate-400 text-sm">
                CertChain operates on a decentralized, double-blind encryption model. We do not store student PII (Personally Identifiable Information) in a centralized database. All academic records are hashed locally and only the cryptographic proof is anchored to the Ethereum ledger.
              </p>
           </section>

           <section className="space-y-4">
              <h3 className="text-xl font-bold text-white">Terms of Service</h3>
              <p className="text-slate-400 text-sm">
                By utilizing the CertChain Registry, institutions agree to maintain the integrity of the cryptographic keys used for certificate issuance. Verification events logged to the blockchain are immutable and cannot be altered or removed.
              </p>
           </section>

           <section className="space-y-4 pt-6 border-t border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 Last updated: April 23, 2026 • Distributed under MIT License.
              </p>
           </section>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
