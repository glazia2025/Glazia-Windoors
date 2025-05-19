const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Nalco } = require('../models/Order');
require('dotenv').config();

// Secret for JWT (you should store this in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Replace with a more secure secret

// API to store user data when they log in with mobile number
const createUser = async (req, res) => {
  const { name, email, gstNumber, pincode, city, state, address, phoneNumber } = req.body;

  // Check if the user already exists
  try {
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      gstNumber,
      pincode,
      city,
      state,
      address,
      phoneNumber,
    });

    // Save the new user
    await newUser.save();

    // Generate a JWT token for the new user
    const token = jwt.sign(
      { userId: newUser._id, phoneNumber, role: 'user' }, // Include relevant data like userId and role
      JWT_SECRET,
      { expiresIn: '1h' } // Token expiration (optional, 1 hour in this case)
    );

    // Send the response with the token
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token, // Include the token in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User API
const getUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Extract userId from the token payload
    const userId = decoded.userId;

    // Fetch the user details from the database
    const user = await User.findById(userId).select('-password'); // Exclude sensitive fields like password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user data in the response
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error verifying token or fetching user:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    // Verify and decode the JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user by ID from the token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile fields
    const { name, email, gstNumber, pincode, city, state, address, phoneNumber } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (gstNumber) user.gstNumber = gstNumber;
    if (pincode) user.pincode = pincode;
    if (city) user.city = city;
    if (state) user.state = state;
    if (address) user.address = address;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Save the updated user data
    await user.save();

    res.status(200).json({
      message: 'User profile updated successfully',
      user,
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getNalco = async (req, res) => {
  try {
      const nalco = await Nalco.find({});
      if (!nalco) {
        return res.status(404).json({ message: 'No data found' });
      }
      res.status(200).json(nalco);
    } catch (error) {
      console.error("Error fetching nalco price:", error);
      res.status(500).json({ message: 'Error fetching nalco price' });
    }
};

module.exports = { createUser, getUser, updateUser, getNalco };
