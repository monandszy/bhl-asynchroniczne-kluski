const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL/MariaDB connection
const db = mysql.createConnection({
  host: "192.168.1.200",
  user: "admin",
  password: "FeverMateusz12",
  database: "econfident",
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MariaDB database");
});

// POST endpoint example
app.post("/api/complaints", (req, res) => {
  const { title, descr, info, cats } = req.body;

  console.log("Received data:", { title, descr, info, cats });

  // First, let's check if the table structure needs to be updated
  const query =
    "INSERT INTO reports (title, descr, info, cats) VALUES (?, ?, ?, ?)";

  db.query(query, [title, descr, info, cats], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      console.error("Error details:", err.sqlMessage);

      // If cats column is integer, we need to alter it
      if (
        err.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD" &&
        err.sqlMessage.includes("cats")
      ) {
        console.log(
          "Cats column needs to be changed to VARCHAR. Run this SQL:"
        );
        console.log("ALTER TABLE reports MODIFY COLUMN cats VARCHAR(255);");
      }

      return res
        .status(500)
        .json({ error: "Database error", details: err.sqlMessage });
    }

    res.status(201).json({
      message: "Complaint submitted successfully",
      id: result.insertId,
    });
  });
});

// GET endpoint with pagination
app.get("/api/complaints", (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  console.log(`Fetching complaints with offset: ${offset}, limit: ${limit}`);

  const query = "SELECT * FROM reports ORDER BY id DESC LIMIT ? OFFSET ?";

  db.query(query, [limit, offset], (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  console.log("Login attempt:", { login });

  const query = "SELECT * FROM users WHERE login = ? AND pass = ?";

  db.query(query, [login, password], (err, results) => {
    if (err) {
      console.error("Error checking login:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const user = results[0];
      res.json({
        success: true,
        message: "Login successful",
        isAdmin: user.admin === 1 || user.admin === true,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

// DELETE endpoint for complaints
app.delete("/api/complaints", (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No IDs provided" });
  }

  console.log("Deleting complaints with IDs:", ids);

  const placeholders = ids.map(() => "?").join(",");
  const query = `DELETE FROM reports WHERE id IN (${placeholders})`;

  db.query(query, ids, (err, result) => {
    if (err) {
      console.error("Error deleting complaints:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      success: true,
      message: "Complaints deleted successfully",
      deletedCount: result.affectedRows,
    });
  });
});

// GET endpoint for users
app.get("/api/users", (req, res) => {
  console.log("Fetching all users");

  const query = "SELECT id, login, admin FROM users ORDER BY id ASC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Convert admin column to boolean
    const users = results.map((user) => ({
      id: user.id,
      login: user.login,
      admin: user.admin === 1 || user.admin === true,
    }));

    res.json(users);
  });
});

// POST endpoint for creating users
app.post("/api/users", (req, res) => {
  const { login, password, admin } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: "Login and password are required" });
  }

  console.log("Creating user:", { login, admin });

  // Check if user already exists
  const checkQuery = "SELECT id FROM users WHERE login = ?";

  db.query(checkQuery, [login], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Insert new user
    const insertQuery =
      "INSERT INTO users (login, pass, admin) VALUES (?, ?, ?)";
    const adminValue = admin ? 1 : 0;

    db.query(insertQuery, [login, password, adminValue], (err, result) => {
      if (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({
        success: true,
        message: "User created successfully",
        id: result.insertId,
      });
    });
  });
});

// DELETE endpoint for users
app.delete("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  console.log("Deleting user with ID:", userId);

  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  });
});

// PUT endpoint for admin response to complaints
app.put("/api/complaints/:id/response", (req, res) => {
  const complaintId = parseInt(req.params.id);
  const { admin_response } = req.body;

  if (!complaintId) {
    return res.status(400).json({ error: "Invalid complaint ID" });
  }

  if (!admin_response) {
    return res.status(400).json({ error: "Admin response is required" });
  }

  console.log("Adding admin response to complaint:", complaintId);

  const query = "UPDATE reports SET admin_response = ? WHERE id = ?";

  db.query(query, [admin_response, complaintId], (err, result) => {
    if (err) {
      console.error("Error updating complaint:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({
      success: true,
      message: "Admin response added successfully",
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
