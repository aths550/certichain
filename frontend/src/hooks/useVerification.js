import { useState, useCallback } from "react";
import { useWallet } from "../context/WalletContext";

export const useVerification = () => {
    const { contract } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const resultToString = (val) => {
        const results = ["Verified", "Tampered", "Revoked", "Not found"];
        return results[val] || "Unknown";
    };

    const verifyCertificate = useCallback(async (certId, hash) => {
        if (!contract) return null;
        setLoading(true);
        setError(null);
        try {
            // First, get the certificate details to check existence/revocation
            const cert = await contract.getCertificateDetails(certId);
            
            // Call the verification function (which writes to audit trail)
            const tx = await contract.verifyCertificate(certId, hash);
            const receipt = await tx.wait();

            // Find the CertificateVerified event to get the result
            const event = receipt.logs
                .map(log => contract.interface.parseLog(log))
                .find(parsed => parsed?.name === "CertificateVerified");

            const result = event?.args.result;

            return {
                result: Number(result),
                resultString: resultToString(Number(result)),
                cert,
                txHash: receipt.hash
            };
        } catch (err) {
            console.error("Verification error:", err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [contract]);

    return { verifyCertificate, loading, error, resultToString };
};
