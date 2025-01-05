import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import AdminLoginForm from './components/AdminLoginForm';
import UserLoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import UserOrders from './components/UserOrders';
import { jwtDecode } from "jwt-decode";
import AdminAddProduct from './components/AdminAddProduct';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); 

  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load

useEffect(() => {
  const decoded = checkTokenExpiration();

  if (decoded) {
    setUserRole(decoded.role);
    setIsLoggedIn(true);
    console.log("after", userRole, isLoggedIn)
    // Navigate only during the initial load
    if (isInitialLoad) {
      if (decoded.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/orders');
      }
      setIsInitialLoad(false);
    }
  } else {
    setIsLoggedIn(false);
    setUserRole(null);
  }
}, [navigate]);


  const onLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('userToken');
  }

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('userToken');
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
  
        if (decoded.exp < currentTime) {
          console.log("decoded.exp", decoded.exp)
          localStorage.removeItem('userToken');
        } else {
          return decoded;
        }
      } catch (error) {
        console.error('Error decoding token', error);
        localStorage.removeItem('userToken');
      }
    }
  };

  return (
    // <Router>
      <div>
        <nav>
          <Link to="/">Home</Link> | 
          {userRole === 'admin' ? (
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          ) : userRole === 'user' ? (
            <Link to="/user/orders">User Orders</Link>
          ) : null}
         {isLoggedIn && <div onClick={onLogout}>Logout</div>}
        </nav>

        <Routes>
          {/* Admin Login Route */}
          <Route path="/" element={<AdminLoginForm setUserRole={setUserRole} setIsLoggedIn={setIsLoggedIn}/>} />
          
          {/* User Login Route */}
          <Route path="/user/login" element={<UserLoginForm setUserRole={setUserRole} />} />

          {/* Admin Dashboard (protected by role check) */}
          {/* <Route path="/admin/dashboard" /> */}
          
          <Route path="/admin/dashboard" element={userRole === 'admin' && isLoggedIn ? <AdminDashboard /> : <Navigate to="/" />} >
            <Route path="add-product" element={<AdminAddProduct />} />
          </Route>
          {/* User Orders page (accessible by regular user only) */}
          <Route path="/user/orders" element={userRole === 'user' && isLoggedIn ? <UserOrders /> : <Navigate to="/" />} />
        </Routes>
      </div>
    // </Router>
  );
}

export default App;
