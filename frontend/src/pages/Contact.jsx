import React from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#051120] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -ml-48 -mb-48" />

      <div className="max-w-4xl w-full space-y-10 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-accent transition-colors">
          <ChevronLeft size={16} /> Back to dashboard
        </Link>

        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto border border-accent/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Mail size={40} className="text-accent" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Get in Touch</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Have questions about certificate authenticity or institutional registration? Our protocol support team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="glass-morphism p-8 border-slate-800 space-y-8 h-full">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ShieldCheck className="text-accent" /> Institutional Support
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Phone className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Support</p>
                    <p className="text-lg font-medium text-white">9503981129</p>
                    <div className="flex gap-4 mt-2">
                      <a href="https://wa.me/919503981129" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest">WhatsApp</a>
                      <a href="sms:+919503981129" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest">SMS Message</a>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Mon - Fri, 9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Mail className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Inquiry</p>
                    <p className="text-lg font-medium text-white">support@certichain.io</p>
                    <p className="text-xs text-slate-500 mt-1">24/7 Response for verification issues</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <MapPin className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Headquarters</p>
                    <p className="text-lg font-medium text-white">Blockchain Innovation Core</p>
                    <p className="text-xs text-slate-500 mt-1">Silicon Valley of India, Pune, Maharashtra</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Connect Form Placeholder */}
          <div className="glass-morphism p-8 border-slate-800 space-y-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Quick Connect</h3>
                <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[8px] font-bold text-green-500 uppercase">Online</div>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
                   <input className="input-field w-full" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message</label>
                   <textarea rows={4} className="input-field w-full resize-none" placeholder="How can we assist you today?" />
                </div>
                <button className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                   <MessageSquare size={18} /> Send Instant Message
                </button>
             </div>
          </div>
        </div>

        {/* Bottom Proof */}
        <div className="text-center pt-10 opacity-40">
           <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <Globe size={14} /> Global Protocol Network
              <span>•</span>
              <ShieldCheck size={14} /> Immutable Storage
              <span>•</span>
              <Clock size={14} /> 24/7 Availability
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
