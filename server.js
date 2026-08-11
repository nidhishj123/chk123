const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const uploadRoutes = require("./routes/upload");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(cors());
app.use(express.json());

// ================================
// DATABASE CONNECTION
// ================================

if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
    });
}

// ================================
// BASIC TEST ROUTE
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "LostFound+ API is running!",
  });
});

// ================================
// AUTH ROUTES
// ================================

// Register:
// POST /api/auth/register

// Login:
// POST /api/auth/login

app.use("/api/auth", authRoutes);

// ================================
// ITEM ROUTES
// ================================

// Create item:
// POST /api/items

// Get all items:
// GET /api/items

app.use("/api/items", itemRoutes);

// ================================
// CLOUDINARY IMAGE UPLOAD
// ================================

// Upload image:
// POST /api/upload

app.use("/api/upload", uploadRoutes);

// ================================
// PROTECTED TEST ROUTE
// ================================

// Test:
// GET /api/protected
//
// Requires:
// Authorization: Bearer YOUR_JWT_TOKEN

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

// ================================
// 404 ROUTE
// ================================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;