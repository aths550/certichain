/**
 * Web3 Utility functions for CertChain
 */

/**
 * Formats an Ethereum address for UI display
 * @param {string} address - The 0x address
 * @returns {string} - Truncated address like 0x123...456
 */
export const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formats a hash for UI display
 * @param {string} hash - The hex hash
 * @returns {string} - Truncated hash
 */
export const formatHash = (hash) => {
    if (!hash) return "";
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
};

/**
 * Computes SHA-256 hash of a file using browser's SubtleCrypto API
 * Matches Node.js crypto.createHash('sha256')
 * @param {File|Blob} file - The file to hash
 * @returns {Promise<string>} - Hex string hash
 */
export const computeFileHash = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
};

/**
 * Converts verification result enum to string
 * @param {number} enumVal 
 * @returns {string}
 */
export const resultToString = (enumVal) => {
    const results = ["Verified", "Tampered", "Revoked", "Not found"];
    return results[enumVal] || "Unknown";
};

/**
 * Formatted date string from Unix timestamp
 * @param {number|BigInt} unix 
 * @returns {string}
 */
export const timestampToDate = (unix) => {
    if (!unix) return "N/A";
    const date = new Date(Number(unix) * 1000);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
