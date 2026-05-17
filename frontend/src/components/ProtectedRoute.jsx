import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert } from "lucide-react";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isConnected, role: walletRole } = useWallet();
  const { isLoggedIn, isAdmin, isCollegeAdmin, currentUser } = useAuth();
  const location = useLocation();

  // --- Local auth check (no blockchain needed) ---
  if (isLoggedIn) {
    if (requiredRole === "superAdmin" && !isAdmin) {
      return (
        <Unauthorized requiredRole={requiredRole} currentRole={currentUser?.role} />
      );
    }
    if (requiredRole === "collegeAdmin" && !isCollegeAdmin && !isAdmin) {
      return (
        <Unauthorized requiredRole={requiredRole} currentRole={currentUser?.role} />
      );
    }
    // Allowed
    return children;
  }

  // --- Blockchain wallet auth fallback ---
  if (isConnected) {
    if (requiredRole && walletRole !== requiredRole && walletRole !== "superAdmin") {
      return <Unauthorized requiredRole={requiredRole} currentRole={walletRole} />;
    }
    return children;
  }

  // --- Not authenticated at all ---
  return <Navigate to="/login" state={{ from: location }} replace />;
};

const Unauthorized = ({ requiredRole, currentRole }) => (
  <div className="min-h-screen bg-[#050912] flex items-center justify-center p-6">
    <div className="glass-morphism max-w-md w-full p-10 text-center border-red-500/20 bg-red-500/[0.02]">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Unauthorized Access</h2>
      <p className="text-slate-400 text-sm mb-8">
        This section requires <strong>{requiredRole}</strong> privileges.
        Your current role is <strong>{currentRole}</strong>.
      </p>
      <button
        onClick={() => window.history.back()}
        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
      >
        Go Back
      </button>
    </div>
  </div>
);

export default ProtectedRoute;
