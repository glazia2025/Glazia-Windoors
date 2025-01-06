const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      { userId: newUser._id, role: 'user' }, // Include relevant data like userId and role
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

module.exports = { createUser };
