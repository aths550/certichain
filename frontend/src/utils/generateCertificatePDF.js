import { jsPDF } from "jspdf";
import QRCode from 'qrcode';

/**
 * Generates a high-fidelity academic certificate PDF matching the UI design
 */
export const generateCertificatePDF = async (certData, txHash) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const w = 297;
    const h = 210;
    const navy = "#0F172A";
    const gold = "#BA7517";
    const lightGold = "#fbbf24";

    // --- Main Borders ---
    doc.setFillColor(navy);
    doc.rect(0, 0, w, h, 'F'); // Navy outer frame
    
    doc.setFillColor(255, 255, 255);
    const frameWidth = 8;
    doc.rect(frameWidth, frameWidth, w - frameWidth * 2, h - frameWidth * 2, 'F'); // White inner area

    // Gold accent line
    doc.setDrawColor(gold);
    doc.setLineWidth(0.3);
    doc.rect(frameWidth + 1, frameWidth + 1, w - (frameWidth + 1) * 2, h - (frameWidth + 1) * 2);

    // --- Header ---
    doc.setFillColor(navy);
    const headerH = 35;
    doc.rect(frameWidth, frameWidth, w - frameWidth * 2, headerH, 'F');

    // Seal / Logo
    doc.setDrawColor(255, 255, 255);
    doc.circle(frameWidth + 20, frameWidth + headerH / 2, 12, 'S');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("serif", "bold");
    const initial = certData.institution ? certData.institution.charAt(0).toUpperCase() : "C";
    doc.text(initial, frameWidth + 20, frameWidth + headerH / 2 + 2, { align: 'center' });

    // Institution Name
    doc.setFont("serif", "bold");
    doc.setFontSize(22);
    doc.text(certData.institution || "ACADEMIC INSTITUTION", frameWidth + 40, frameWidth + 12);
    
    doc.setTextColor(lightGold);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ACCREDITED INSTITUTIONAL CREDENTIAL • AICTE/ISO COMPLIANT", frameWidth + 40, frameWidth + 18);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Government Recognized • ISO 9001:2015 Certified", frameWidth + 40, frameWidth + 23);

    // Verified Badge
    doc.setDrawColor(255, 255, 255);
    doc.rect(w - frameWidth - 40, frameWidth + 5, 30, 25);
    doc.setTextColor(lightGold);
    doc.setFontSize(8);
    doc.text("CERTCHAIN", w - frameWidth - 25, frameWidth + 15, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.text("VERIFIED", w - frameWidth - 25, frameWidth + 20, { align: 'center' });

    // --- Body ---
    doc.setTextColor(navy);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Certificate of Completion", w / 2, frameWidth + headerH + 15, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.text("This is to certify that", w / 2, frameWidth + headerH + 25, { align: 'center' });

    // Student Name
    doc.setTextColor(navy);
    doc.setFontSize(40);
    doc.setFont("serif", "bold");
    doc.text(certData.studentName.toUpperCase(), w / 2, frameWidth + headerH + 45, { align: 'center' });
    
    // Underline
    doc.setDrawColor(gold);
    doc.setLineWidth(1.5);
    const nameW = doc.getTextWidth(certData.studentName.toUpperCase());
    doc.line(w / 2 - nameW / 2, frameWidth + headerH + 48, w / 2 + nameW / 2, frameWidth + headerH + 48);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`having Roll Number ${certData.rollNumber} has successfully completed all requirements for the degree of`, w / 2, frameWidth + headerH + 60, { align: 'center' });

    // Degree
    doc.setTextColor(24, 95, 165); // Blue
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(certData.degree, w / 2, frameWidth + headerH + 75, { align: 'center' });

    // CGPA
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`with CGPA ${certData.cgpa} / 10.0`, w / 2, frameWidth + headerH + 85, { align: 'center' });

    // --- Signatures ---
    const sigY = 175;
    const col1 = 60;
    const col2 = w / 2;
    const col3 = w - 60;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(col1 - 25, sigY, col1 + 25, sigY);
    doc.line(col3 - 25, sigY, col3 + 25, sigY);
    doc.line(col2 - 25, sigY, col2 + 25, sigY);

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Controller of Examinations", col1, sigY + 5, { align: 'center' });
    doc.text("Principal & Dean", col3, sigY + 5, { align: 'center' });
    
    const issueDate = new Date(Number(certData.issuedAt) * 1000).toLocaleDateString();
    doc.text(issueDate, col2, sigY - 5, { align: 'center' });
    doc.text("Issue Date", col2, sigY + 5, { align: 'center' });

    // --- QR Code & Proof ---
    const params = new URLSearchParams({
        id: certData.certId,
        hash: certData.sha256Hash || "",
        name: certData.studentName || "",
        roll: certData.rollNumber || "",
        degree: certData.degree || ""
    });
    const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
    const verifyUrl = `${baseUrl}/verify?${params.toString()}`;
    
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#0F172A', light: '#ffffff' }
    });
    
    const qrSize = 35;
    doc.addImage(qrDataUrl, 'PNG', w - frameWidth - qrSize - 10, sigY - 35, qrSize, qrSize);
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("Scan to verify", w - frameWidth - qrSize / 2 - 10, sigY + 5, { align: 'center' });

    // Proof snippet
    doc.setFontSize(7);
    doc.setTextColor(navy);
    doc.text(`AUTHENTICITY PROOF`, w - frameWidth - qrSize - 10, sigY - 18, { align: 'right' });
    
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    const proofX = w - frameWidth - qrSize - 10;
    doc.text(`CERT ID: ${certData.certId}`, proofX, sigY - 14, { align: 'right' });
    
    // Split hash for better fit if needed
    const hash = certData.sha256Hash;
    const hashLine1 = hash.slice(0, 32);
    const hashLine2 = hash.slice(32);
    doc.text(`HASH PART 1: ${hashLine1}`, proofX, sigY - 10, { align: 'right' });
    doc.text(`HASH PART 2: ${hashLine2}`, proofX, sigY - 7, { align: 'right' });
    
    doc.setTextColor(0, 150, 0);
    doc.setFontSize(7);
    doc.text("• ON-CHAIN VERIFIED", proofX, sigY - 3, { align: 'right' });

    // --- Footer ---
    doc.setFillColor(navy);
    doc.rect(frameWidth, h - frameWidth - 8, w - frameWidth * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("CertChain Protocol • Blockchain Verified", frameWidth + 10, h - frameWidth - 3);
    doc.text(`Powered by Ethereum • IPFS • Sepolia`, w / 2, h - frameWidth - 3, { align: 'center' });
    doc.setFontSize(6);
    doc.text(`Tx: ${txHash || "N/A"}`, w - frameWidth - 10, h - frameWidth - 3, { align: 'right' });

    doc.save(`Official_Certificate_${certData.certId}.pdf`);
};
