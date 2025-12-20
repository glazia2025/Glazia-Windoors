const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const path = require("path");

require('dotenv').config({ path: path.resolve(__dirname, '../prod.env') })
require("./utils/cron");

const connectDB = require("./db");
const PORT = process.env.PORT || 5555;

// Load environment variables
// require('dotenv').config({ path: '/etc/app.env' });

// Middleware
app.use(
  cors({
    origin: [
      "https://glazia.in",
      "https://www.glazia.in",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://splendid-begonia-cbc292.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
); // Allow cross-origin requests
app.use(express.json({ extended: false, limit: "10mb" }));

connectDB();

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin-form");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const quotationAdminRoutes = require("./routes/quotationAdminRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/quotations", quotationAdminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quotations", quotationRoutes);


// Root route for testing
app.get("/", (req, res) => {
  console.log('Reached');
  res.send("Server is running!");
});
// duTlxgmhfnwZXzSb
// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
