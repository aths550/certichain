import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";

export const useBlockNumber = () => {
    const { provider } = useWallet();
    const [blockNumber, setBlockNumber] = useState(null);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (!provider) return;

        const fetchBlock = async () => {
            try {
                const num = await provider.getBlockNumber();
                setBlockNumber(num);
                setIsLive(true);
            } catch (err) {
                console.error("Block polling error:", err);
                setIsLive(false);
            }
        };

        fetchBlock();
        const interval = setInterval(fetchBlock, 3000);

        return () => clearInterval(interval);
    }, [provider]);

    return { blockNumber, isLive };
};
