const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const DB_FILE = path.join(__dirname, "../students.json");

// Helper to read DB
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify({ students: [], activities: [] }));
        }
        return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (err) {
        console.error("DB Read Error", err);
        return { students: [], activities: [] };
    }
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// GET all students
router.get("/", (req, res) => {
    const db = readDB();
    res.json(db.students);
});

// POST to register a student
router.post("/register", (req, res) => {
    const db = readDB();
    const student = req.body;
    
    // Check if exists
    if (db.students.find(s => s.username === student.username || s.email === student.email)) {
        return res.status(400).json({ error: "Student already exists" });
    }
    
    db.students.push(student);
    writeDB(db);
    res.json({ success: true, student });
});

// GET activities
router.get("/activities", (req, res) => {
    const db = readDB();
    const { username } = req.query;
    if (username) {
        res.json(db.activities.filter(a => a.username === username));
    } else {
        res.json(db.activities);
    }
});

// POST an activity
router.post("/activities", (req, res) => {
    const db = readDB();
    const activity = req.body;
    db.activities.unshift(activity); // Add to front
    writeDB(db);
    res.json({ success: true });
});

// DELETE a student
router.delete("/:username", (req, res) => {
    const db = readDB();
    db.students = db.students.filter(s => s.username !== req.params.username);
    // optionally remove their activities as well
    db.activities = db.activities.filter(a => a.username !== req.params.username);
    writeDB(db);
    res.json({ success: true });
});

// PUT to suspend/unsuspend a student
router.put("/:username/suspend", (req, res) => {
    const db = readDB();
    const { suspended } = req.body;
    const student = db.students.find(s => s.username === req.params.username);
    if (student) {
        student.suspended = suspended;
        writeDB(db);
        res.json({ success: true, student });
    } else {
        res.status(404).json({ error: "Student not found" });
    }
});

module.exports = router;
