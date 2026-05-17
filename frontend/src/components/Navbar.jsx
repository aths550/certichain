import { Link, useNavigate } from "react-router-dom";
import { Search, PlusCircle, Layout, Wallet, LayoutDashboard, LogIn, LogOut, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({ account, connectWallet, isConnecting }) => {
  const { isLoggedIn, isAdmin, isCollegeAdmin, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="border-b border-slate-800 bg-primary/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Layout className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            CertChain
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/verify" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Search size={20} /> Verify
          </Link>

          {/* Show dashboard links only when logged in */}
          {isLoggedIn ? (
            <>
              <Link to="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <LayoutDashboard size={20} />
                {isAdmin ? "Admin Dashboard" : "College Dashboard"}
              </Link>
              {(isAdmin || isCollegeAdmin) && (
                <Link to="/issue" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <PlusCircle size={20} /> Issue Certificate
                </Link>
              )}
            </>
          ) : (
            <Link to="/issue" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <PlusCircle size={20} /> Issue
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Connect Wallet button */}
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm text-slate-300"
          >
            <Wallet size={16} />
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : isConnecting
              ? "Connecting..."
              : "Wallet"}
          </button>

          {/* Auth button */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-primary flex items-center gap-2 !py-2 !px-4 !rounded-full text-sm"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

