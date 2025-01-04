import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const LoginForm = ({ setUserRole }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate(); // Initialize useNavigate to manage routing

  const sendOtp = async () => {
    const phoneRegex = /^[0-9]{10}$/; // Validate phone number (simple 10-digit check)
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', { phoneNumber });
      setMessage(response.data.message);
      setIsOtpSent(true);
      setErrorMessage(''); // Reset error message on success
    } catch (error) {
      setMessage('');
      setErrorMessage('Failed to send OTP. Please try again.');
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setErrorMessage('Please enter the OTP.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { phoneNumber, otp });
      setMessage(response.data.message);
      console.log('JWT Token:', response.data.token);
      
      // Store token securely
      localStorage.setItem('userToken', response.data.token);
      
      setErrorMessage(''); // Reset error message on success
      const decoded = JSON.parse(atob(response.data.token.split('.')[1])); // Decode JWT
      setUserRole(decoded.role); // Set user role based on decoded JWT

      console.log("user login", decoded.role)
      if (decoded.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/orders');
      }
      // After successful OTP verification, route to /user/orders
    } catch (error) {
      setMessage('');
      setErrorMessage('Invalid OTP. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem', textAlign: 'center' }}>
      <h2>Login with WhatsApp OTP</h2>
      {!isOtpSent ? (
        <>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
          <button onClick={sendOtp} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
          <button onClick={verifyOtp} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Verify OTP
          </button>
        </>
      )}
      
      {/* Display messages */}
      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      {errorMessage && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</p>}
    </div>
  );
};

export default LoginForm;
