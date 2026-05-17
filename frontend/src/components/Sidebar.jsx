import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { LayoutDashboard, PlusCircle, History, ShieldAlert, Users, UserCircle, ShieldCheck, GraduationCap } from "lucide-react";

const Sidebar = () => {
  const { account } = useWallet();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Issue Certificate", icon: PlusCircle, href: "/issue" },
    { label: "Audit Trail", icon: History, href: "/audit" },
    { label: "Revocations", icon: ShieldAlert, href: "/revocations" },
    ...(isAdmin ? [
      { label: "Colleges", icon: Users, href: "/register-college" },
      { label: "Students", icon: GraduationCap, href: "/admin/students" }
    ] : []),
  ];

  return (
    <div 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`h-screen fixed left-0 top-0 bg-[#050912] border-r border-white/5 flex flex-col z-40 transition-all duration-300 ease-in-out ${isExpanded ? 'w-[220px]' : 'w-[75px]'}`}
    >
      <div className={`p-6 pb-10 flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
        <div className="w-9 h-9 min-w-[36px] bg-accent rounded-lg flex items-center justify-center">
          <ShieldCheck className="text-white" size={20} />
        </div>
        {isExpanded && (
          <div className="whitespace-nowrap overflow-hidden opacity-100 transition-opacity">
            <h2 className="text-sm font-bold tracking-tight text-white leading-none mb-1">CertChain</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-none">
              {isAdmin ? "Super Admin" : "College Admin"}
            </p>
          </div>
        )}
      </div>

      <div className={`px-4 space-y-1.5 flex-1 ${!isExpanded && 'px-2 items-center flex flex-col'}`}>
        {isExpanded && <p className="px-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 whitespace-nowrap">Main Menu</p>}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <div
              key={item.label}
              title={!isExpanded ? item.label : ""}
              className={`flex items-center justify-between py-3 rounded-lg cursor-pointer transition-all duration-150 ${
                isActive ? "bg-accent/10 text-accent font-medium shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"
              } ${isExpanded ? 'px-4' : 'px-3 w-max'}`}
              onClick={() => navigate(item.href)}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="min-w-[18px]" />
                {isExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </div>
              {item.badge && isExpanded && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm shadow-red-500/20">{item.badge}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className={`p-6 border-t border-white/5 flex flex-col gap-4 ${!isExpanded && 'p-4 items-center'}`}>
         <div className={`flex items-center gap-3 ${isExpanded ? 'px-2' : ''}`}>
            <UserCircle size={18} className="text-slate-500 min-w-[18px]" title={currentUser?.name} />
            {isExpanded && (
              <span className="text-xs text-slate-500 font-mono tracking-tighter truncate whitespace-nowrap">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : currentUser?.name || "Logged in"}
              </span>
            )}
         </div>
         <div className={`flex items-center gap-2 ${isExpanded ? 'px-2' : ''}`}>
            <div className="w-1.5 h-1.5 min-w-[6px] rounded-full bg-green-500 animate-blink" />
            {isExpanded && (
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight whitespace-nowrap truncate">
                {currentUser?.collegeName || currentUser?.name || "Administrator"}
              </span>
            )}
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
