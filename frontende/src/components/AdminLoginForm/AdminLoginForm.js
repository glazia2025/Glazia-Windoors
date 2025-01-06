import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLoginForm = ({ setUserRole, setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', { username, password });

      // Save the JWT token in localStorage
      localStorage.setItem('authToken', response.data.token);

      // Decode JWT token to get the role (admin or user)
      const decoded = JSON.parse(atob(response.data.token.split('.')[1])); // Decode JWT
      setUserRole(decoded.role); // Set user role based on decoded JWT
      setIsLoggedIn(true)
      // Redirect to the appropriate page based on role
      if (decoded.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/orders');
      }
    } catch (error) {
      setMessage(error.response ? error.response.data.message : 'An error occurred');
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminLoginForm;
