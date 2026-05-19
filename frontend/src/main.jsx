import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WalletProvider } from "./context/WalletContext";
import { AuthProvider } from "./context/AuthContext";
import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.endsWith('.ngrok-free.dev');

axios.defaults.baseURL = isLocal ? '' : 'https://certichain-mc98.onrender.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </WalletProvider>
  </StrictMode>,
)
