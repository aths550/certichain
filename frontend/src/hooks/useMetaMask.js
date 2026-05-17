import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setError(null);
    } catch (err) {
      setError("Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  return { account, error, isConnecting, connectWallet };
};
