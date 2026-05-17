import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Default admin credentials
const ADMINS = [
  {
    username: "admin",
    password: "certchain@admin123",
    role: "superAdmin",
    name: "System Administrator",
  },
  {
    username: "aths.550",
    password: "athu.550",
    role: "superAdmin",
    name: "Aths Administrator",
  }
];

// Initialize college store from localStorage
const loadColleges = () => {
  try {
    return JSON.parse(localStorage.getItem("certchain_colleges") || "[]");
  } catch {
    return [];
  }
};

const saveColleges = (colleges) => {
  localStorage.setItem("certchain_colleges", JSON.stringify(colleges));
};

import axios from "axios";
// Configure axios to bypass ngrok warnings for API requests
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "69420";

// --- Student Store (Global Sync via API) ---
// We fetch this via an effect, but fallback to local
const loadStudents = () => {
  try { return JSON.parse(localStorage.getItem("certchain_students") || "[]"); } catch { return []; }
};

export const logStudentActivity = async (username, action, details) => {
  try {
    const activity = { username, action, details, timestamp: Date.now() };
    await axios.post("/api/students/activities", activity);
  } catch (e) {
    console.warn("Activity sync delayed", e);
  }
};

export const getStudentActivities = (username) => {
  // We'll rely on the backend for robust queries, but for now we'll do real-time fetches below.
  return [];
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [colleges, setColleges] = useState(loadColleges);
  const [students, setStudents] = useState(loadStudents);
  const [authError, setAuthError] = useState(null);

  const syncStudents = React.useCallback(async () => {
     try {
        const res = await axios.get("/api/students");
        setStudents(res.data);
        localStorage.setItem("certchain_students", JSON.stringify(res.data));
     } catch (e) {}
  }, []);

  const deleteStudent = async (username) => {
    try {
      await axios.delete(`/api/students/${username}`);
      await syncStudents();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const toggleSuspendStudent = async (username, currentStatus) => {
    try {
      await axios.put(`/api/students/${username}/suspend`, { suspended: !currentStatus });
      await syncStudents();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Rehydrate & Sync Global Accounts
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("certchain_session") || "null");
      if (saved) setCurrentUser(saved);
    } catch {}

    syncStudents();
  }, [syncStudents]);

  const login = (username, password) => {
    setAuthError(null);

    // Check admin
    const adminUser = ADMINS.find(a => a.username === username && a.password === password);
    if (adminUser) {
      const user = { role: "superAdmin", name: adminUser.name, username };
      setCurrentUser(user);
      localStorage.setItem("certchain_session", JSON.stringify(user));
      return { success: true, role: "superAdmin" };
    }

    // Check colleges
    const college = colleges.find(
      (c) => c.username === username && c.password === password
    );
    if (college) {
      const user = {
        role: "collegeAdmin",
        name: college.name,
        username: college.username,
        collegeId: college.id,
        collegeName: college.name,
      };
      setCurrentUser(user);
      localStorage.setItem("certchain_session", JSON.stringify(user));
      return { success: true, role: "collegeAdmin" };
    }

    // Check students
    const student = students.find(
      (s) => s.username === username && s.password === password
    );
    if (student) {
      if (student.suspended) {
        setAuthError("Your account has been suspended by an administrator.");
        return { success: false };
      }
      const user = {
        role: "student",
        name: student.name,
        username: student.username,
        studentId: student.id,
      };
      setCurrentUser(user);
      localStorage.setItem("certchain_session", JSON.stringify(user));
      logStudentActivity(student.username, "Login", "Student logged into the portal.");
      return { success: true, role: "student" };
    }

    setAuthError("Invalid username or password.");
    return { success: false };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("certchain_session");
  };

  const registerCollege = (data) => {
    setAuthError(null);
    const existing = colleges.find(
      (c) => c.username === data.username || c.email === data.email
    );
    if (existing) {
      setAuthError("A college with this username or email already exists.");
      return { success: false };
    }
    const newCollege = {
      id: `COLLEGE-${Date.now()}`,
      name: data.name,
      email: data.email,
      username: data.username,
      password: data.password,
      location: data.location || "",
      createdAt: new Date().toISOString(),
    };
    const updated = [...colleges, newCollege];
    setColleges(updated);
    saveColleges(updated);
    return { success: true, college: newCollege };
  };

  const deleteCollege = (id) => {
    const updated = colleges.filter((c) => c.id !== id);
    setColleges(updated);
    saveColleges(updated);
  };

  const registerStudent = async (data) => {
    setAuthError(null);
    const existing = students.find(
      (s) => s.username === data.username || s.email === data.email
    );
    if (existing) {
      setAuthError("A student with this username or email already exists.");
      return { success: false };
    }
    const newStudent = {
      id: `STU-${Date.now()}`,
      name: data.name,
      email: data.email,
      username: data.username,
      password: data.password,
      rollNumber: data.rollNumber || "",
      institution: data.institution || "",
      createdAt: new Date().toISOString(),
    };

    try {
       await axios.post("/api/students/register", newStudent);
    } catch(e) {}

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("certchain_students", JSON.stringify(updated));
    logStudentActivity(newStudent.username, "Account Created", "Student registered a new account.");
    return { success: true, student: newStudent };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        colleges,
        students,
        authError,
        login,
        logout,
        registerCollege,
        deleteCollege,
        registerStudent,
        syncStudents,
        deleteStudent,
        toggleSuspendStudent,
        isAdmin: currentUser?.role === "superAdmin",
        isCollegeAdmin: currentUser?.role === "collegeAdmin",
        isStudent: currentUser?.role === "student",
        isLoggedIn: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
