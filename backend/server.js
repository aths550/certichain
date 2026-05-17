require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Routes
const hashRoutes = require("./routes/hash");
const ipfsRoutes = require("./routes/ipfs");
const certificateRoutes = require("./routes/certificate");
const auditRoutes = require("./routes/audit");
const statsRoutes = require("./routes/stats");
const studentsRoutes = require("./routes/students");

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
console.log("Mounting routes...");
app.use("/api/hash", hashRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/students", studentsRoutes);

console.log("Mounting stats route...");
app.use("/api/stats", statsRoutes);

app.get("/api/test-direct", (req, res) => {
    res.json({ message: "Direct route works" });
});



// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || "Something went wrong!"
    });
});

app.listen(port, () => {
    console.log(`CertChain Backend listening at http://localhost:${port}`);
});
