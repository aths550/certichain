import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [state, setState] = useState({
    account: null,
    provider: null,
    signer: null,
    contract: null,
    chainId: null,
    isConnected: false,
    role: "public", // public, student, collegeAdmin, superAdmin
    isLoading: true,
    error: null,
  });

  const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111
  const LOCAL_CHAIN_ID = "0x539"; // 1337

  const detectRole = async (contract, address) => {
    try {
      const superAdminRole = await contract.SUPER_ADMIN_ROLE();
      const collegeAdminRole = await contract.COLLEGE_ADMIN_ROLE();
      const studentRole = await contract.STUDENT_ROLE();

      if (await contract.hasRole(superAdminRole, address)) return "superAdmin";
      if (await contract.hasRole(collegeAdminRole, address)) return "collegeAdmin";
      if (await contract.hasRole(studentRole, address)) return "student";
      return "public";
    } catch (error) {
      console.error("Role detection failed:", error);
      return "public";
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Test Network",
              nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            }],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setState(s => ({ ...s, error: "Please install MetaMask", isLoading: false }));
      return;
    }

    try {
      setState(s => ({ ...s, isLoading: true, error: null }));
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const account = accounts[0];
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = "0x" + network.chainId.toString(16);

      if (chainId !== SEPOLIA_CHAIN_ID && chainId !== LOCAL_CHAIN_ID) {
        await switchToSepolia();
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const role = await detectRole(contract, account);

      const newState = {
        account,
        provider,
        signer,
        contract,
        chainId,
        isConnected: true,
        role,
        isLoading: false,
        error: null,
      };

      setState(newState);
      localStorage.setItem("wallet_connected", "true");
    } catch (error) {
      console.error("Connection failed:", error);
      setState(s => ({ ...s, error: error.message, isLoading: false }));
    }
  }, []);

  const disconnectWallet = () => {
    setState({
      account: null,
      provider: null,
      signer: null,
      contract: null,
      chainId: null,
      isConnected: false,
      role: "public",
      isLoading: false,
      error: null,
    });
    localStorage.removeItem("wallet_connected");
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) connectWallet();
        else disconnectWallet();
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      if (localStorage.getItem("wallet_connected") === "true") {
        connectWallet();
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [connectWallet]);

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnectWallet, switchToSepolia }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
