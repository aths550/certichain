import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WalletProvider } from "./context/WalletContext";
import { AuthProvider } from "./context/AuthContext";
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5005';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </WalletProvider>
  </StrictMode>,
)
