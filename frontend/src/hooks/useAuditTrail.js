import { useState, useCallback, useEffect } from "react";
import { useWallet } from "../context/WalletContext";

export const useAuditTrail = () => {
    const { contract } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAuditTrail = useCallback(async (certId) => {
        if (!contract) return [];
        setLoading(true);
        try {
            const trail = await contract.getAuditTrail(certId);
            return trail;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [contract]);

    const fetchGlobalLog = useCallback(async () => {
        if (!contract) return [];
        setLoading(true);
        try {
            const log = await contract.getGlobalAuditLog();
            return [...log].reverse();
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [contract]);

    const listenToEvents = useCallback((onEvent) => {
        if (!contract) return;

        const filters = [
            contract.filters.CertificateIssued(),
            contract.filters.CertificateVerified(),
            contract.filters.CertificateRevoked()
        ];

        filters.forEach(filter => contract.on(filter, onEvent));

        return () => {
            filters.forEach(filter => contract.off(filter, onEvent));
        };
    }, [contract]);

    return { fetchAuditTrail, fetchGlobalLog, listenToEvents, loading, error };
};
