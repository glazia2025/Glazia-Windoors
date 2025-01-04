import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import AdminLoginForm from './components/AdminLoginForm';
import UserLoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import UserOrders from './components/UserOrders';

function App() {
  const [userRole, setUserRole] = useState(null); // State to store the role of the logged-in user

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role);
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, []);

  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Home</Link> | 
          {userRole === 'admin' ? (
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          ) : userRole === 'user' ? (
            <Link to="/user/orders">User Orders</Link>
          ) : null}
        </nav>

        <Routes>
          {/* Admin Login Route */}
          <Route path="/" element={<AdminLoginForm setUserRole={setUserRole} />} />
          
          {/* User Login Route */}
          <Route path="/user/login" element={<UserLoginForm setUserRole={setUserRole} />} />

          {/* Admin Dashboard (protected by role check) */}
          <Route path="/admin/dashboard" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />

          {/* User Orders page (accessible by regular user only) */}
          <Route path="/user/orders" element={userRole === 'user' ? <UserOrders /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
