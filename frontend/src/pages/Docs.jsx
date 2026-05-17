import React from "react";
import { Shield, Book, Lock, FileText, ChevronLeft, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-[#051120] text-slate-200 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-accent">
          <ChevronLeft size={16} /> Dashboard
        </Link>

        <div className="space-y-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
             <Book className="text-blue-400" size={24} />
          </div>
          <h1 className="text-4xl font-black text-white">Documentation</h1>
          <p className="text-slate-400">Everything you need to know about the CertChain protocol architecture and verification logic.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[
             { title: "Quick Start", desc: "Issuing your first blockchain certificate in under 2 minutes.", icon: Shield },
             { title: "Verification API", desc: "How to integrate our verification gateway into your institution portal.", icon: Globe },
             { title: "IPFS Strategy", desc: "Understanding the decentralized storage layer for academic documents.", icon: Lock },
             { title: "Smart Contract", desc: "Deep dive into our Ethereum registry and audit trail logic.", icon: FileText }
           ].map((item, i) => (
             <div key={i} className="glass-morphism p-8 border-white/5 hover:border-blue-500/30 transition-all group">
                <item.icon className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
