const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const otpStore = {};
const staticAdmin = {
  username: 'admin',
  password: ''
};

const password = 'admin123';

// Hash the password asynchronously
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    // Now that the password is hashed, create the staticAdmin object

    staticAdmin.password = hashedPassword;
    // Log the hashed password for confirmation
    console.log('Hashed password:', hashedPassword);

    // You can now use staticAdmin as expected
    console.log(staticAdmin);
  }
});

const sendWhatsAppOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  try {
    // Store OTP in memory (temporary for demonstration)
    otpStore[phoneNumber] = otp;

    // Replace this with the actual WhatsApp API endpoint and configuration
    console.log(`OTP for ${phoneNumber}: ${otp}`); // Simulate sending OTP via WhatsApp

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOTP = (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (otpStore[phoneNumber] === otp) {
    delete otpStore[phoneNumber]; // Clear OTP after verification
    const token = jwt.sign({ phoneNumber, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.status(200).json({ message: 'OTP verified successfully', token });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (username !== staticAdmin.username) {
    return res.status(400).json({ message: 'Invalid username' });
  }

  // Compare hashed password
  bcrypt.compare(password, staticAdmin.password, (err, isMatch) => {
    if (err || !isMatch) {
      console.error('Error comparing passwords:', password);
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create JWT token with role as 'admin'
    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token as response
    res.status(200).json({ message: 'Login successful', token });
  });
};

module.exports = { sendWhatsAppOTP, verifyOTP, adminLogin };
