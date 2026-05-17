import { useState, useCallback } from "react";
import { useWallet } from "../context/WalletContext";

export const useCertificates = () => {
  const { contract, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentCertificates = useCallback(async (address) => {
    if (!contract) return [];
    setLoading(true);
    setError(null);
    try {
      const ids = await contract.getStudentCertificates(address);
      const certs = await Promise.all(
        ids.map(id => contract.getCertificateDetails(id))
      );
      return certs;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const fetchCertificateDetails = useCallback(async (certId) => {
    if (!contract) return null;
    setLoading(true);
    setError(null);
    try {
      const details = await contract.getCertificateDetails(certId);
      return details;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const issueCertificate = async (params) => {
    if (!contract) throw new Error("Contract not initialized");
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.issueCertificate(
        params.certId,
        params.sha256Hash,
        params.ipfsCID,
        params.studentAddress,
        params.studentName,
        params.rollNumber,
        params.degree,
        params.institution,
        params.cgpa
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revokeCertificate = async (certId, reason) => {
    if (!contract) throw new Error("Contract not initialized");
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.revokeCertificate(certId, reason);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError(null);

  return { 
    loading, 
    error, 
    fetchStudentCertificates, 
    fetchCertificateDetails, 
    issueCertificate, 
    revokeCertificate,
    resetError 
  };
};
