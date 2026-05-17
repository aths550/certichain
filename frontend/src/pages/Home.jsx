import { Link } from "react-router-dom";
import { Shield, CheckCircle, Clock, Zap, ArrowRight, ShieldCheck, GraduationCap, Building } from "lucide-react";

export const Home = () => {
  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="pt-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/20 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Trust. Verify. <span className="text-accent underline decoration-accent/30">Secure.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            The world's most advanced blockchain registry for academic certificates. 
            Eliminate forgery and simplify verification instantly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/verify" className="btn-primary flex items-center gap-2 text-lg py-3 px-8">
              Verify Certificate <ArrowRight size={20} />
            </Link>
            <Link to="/issue" className="glass-morphism px-8 py-3 text-lg font-semibold hover:bg-slate-800 transition-colors">
              I'm an Institution
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Certificates Issued", value: "12,400+", icon: GraduationCap },
            { label: "Trusted Institutions", value: "85+", icon: Building },
            { label: "Verifications Today", value: "2,100+", icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="glass-morphism p-8 text-center hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-accent" size={24} />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why CertChain?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our platform leverages Ethereum and IPFS to provide an immutable and transparent proof of academic achievement.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Immutable Storage",
              desc: "Certificates are hashed and stored on-chain, ensuring they can never be altered or forged.",
              icon: Shield,
            },
            {
              title: "Instant Verification",
              desc: "Compare uploaded PDFs against blockchain signatures in milliseconds.",
              icon: Zap,
            },
            {
              title: "IPFS Protected",
              desc: "Copies of original documents are pinned to IPFS for decentralized availability.",
              icon: CheckCircle,
            },
            {
              title: "Complete Audit Trail",
              desc: "Every verification attempt and contract interaction is logged for transparency.",
              icon: Clock,
            },
            {
              title: "Global Standards",
              desc: "Adopted by top tier universities and hiring managers globally.",
              icon: Building,
            },
            {
              title: "Self-Sovereign",
              desc: "Students have full control over their own digital credentials.",
              icon: ShieldCheck,
            },
          ].map((feature, i) => (
            <div key={i} className="glass-morphism p-8 border-slate-800 hover:border-accent/30 group transition-all">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <feature.icon size={28} className="text-accent group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
