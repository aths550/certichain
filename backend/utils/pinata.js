const axios = require("axios");
const FormData = require("form-data");
const stream = require("stream");

const pinFile = async (buffer, filename) => {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    
    let data = new FormData();
    const readableStream = new stream.PassThrough();
    readableStream.end(buffer);
    
    data.append("file", readableStream, {
        filename: filename,
    });

    const response = await axios.post(url, data, {
        maxBodyLength: "Infinity",
        headers: {
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET,
        },
    });

    return {
        ipfsCID: response.data.IpfsHash,
        size: response.data.PinSize,
        timestamp: response.data.Timestamp
    };
};

const getFileUrl = (cid) => {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

module.exports = {
    pinFile,
    getFileUrl
};
