import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ShieldCheck, Globe } from "lucide-react";
import { CONTRACT_ADDRESS } from "./utils/contract";
import { useWallet } from "./context/WalletContext";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import StudentPortal from "./pages/StudentPortal";
import VerifyPortal from "./pages/VerifyPortal";
import AuditTrail from "./pages/AuditTrail";
import RevocationManager from "./pages/RevocationManager";
import IssueCertificate from "./pages/IssueCertificate";
import LoginPage from "./pages/LoginPage";
import CollegeRegister from "./pages/CollegeRegister";
import StudentRegister from "./pages/StudentRegister";
import AdminStudents from "./pages/AdminStudents";
import ContactPage from "./pages/Contact";
import DocsPage from "./pages/Docs";
import LegalPage from "./pages/Legal";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { account, connectWallet, isConnecting } = useWallet();
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-[#050912]">
        <Navbar
          account={account}
          connectWallet={connectWallet}
          isConnecting={isConnecting}
        />

        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify" element={<VerifyPortal />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/register-college" 
              element={
                <ProtectedRoute requiredRole="superAdmin">
                  <CollegeRegister />
                </ProtectedRoute>
              } 
            />
            <Route path="/register-student" element={<StudentRegister />} />

            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentPortal account={account} />
                </ProtectedRoute>
              }
            />

            {/* College Admin & Super Admin — both roles can access /admin and /issue */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="collegeAdmin">
                  <AdminDashboard account={account} currentUser={currentUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issue"
              element={
                <ProtectedRoute requiredRole="collegeAdmin">
                  <IssueCertificate account={account} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revocations"
              element={
                <ProtectedRoute requiredRole="collegeAdmin">
                  <RevocationManager account={account} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requiredRole="superAdmin">
                  <AdminStudents />
                </ProtectedRoute>
              }
            />

            {/* Audit — public for transparency */}
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/legal" element={<LegalPage />} />

            {/* Fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>

        <footer className="bg-[#030712] border-t border-white/5 pt-20 pb-10">
          <div className="container mx-auto px-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <ShieldCheck className="text-accent" size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-white tracking-tighter">CertChain</h2>
                </div>
                <p className="text-slate-500 max-w-sm leading-relaxed">
                  The global standard for decentralized academic credentialing. Built on Ethereum L1 and IPFS.
                </p>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Protocol</h4>
                <ul className="space-y-4">
                  <li><Link to="/docs" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</Link></li>
                  <li><a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">Smart Contracts</a></li>
                  <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Open Source</a></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Company</h4>
                <ul className="space-y-4">
                  <li><Link to="/legal" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/legal" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-6">
               <div className="flex items-center gap-6">
                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] font-mono text-slate-500">
                     {CONTRACT_ADDRESS.slice(0,6)}...{CONTRACT_ADDRESS.slice(-4)}sepolia
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-green-500/60">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     Powered by Ethereum + IPFS
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Globe className="text-slate-700" size={18} />
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2026 CertChain</p>
               </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
