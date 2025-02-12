const express = require('express');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const connectDB = require('./db');


// Load environment variables
require('dotenv').config({ path: '/etc/app.env' });


// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json({ extended: false, limit: '10mb' }));

connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin-form');
const userRoutes = require('./routes/userRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', userRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is running!');
});
// duTlxgmhfnwZXzSb
// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
