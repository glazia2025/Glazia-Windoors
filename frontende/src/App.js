import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import AdminLoginForm from './components/AdminLoginForm/AdminLoginForm';
import UserLoginForm from './components/UserLoginForm/UserLoginForm';
import AdminDashboard from './components/AdminDashboard';
import UserOrders from './components/UserOrders';
import { jwtDecode } from "jwt-decode";
import AdminAddProduct from './components/AdminAddProduct';
import Header from './components/Header/Header';
import UserProfile from './components/UserProfile/UserProfile';

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
    console.log("isInitialLoad", isInitialLoad)

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
    localStorage.removeItem('authToken');
  }

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('authToken');
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
  
        if (decoded.exp < currentTime) {
          console.log("decoded.exp", decoded.exp)
          localStorage.removeItem('authToken');
        } else {
          return decoded;
        }
      } catch (error) {
        console.error('Error decoding token', error);
        localStorage.removeItem('authToken');
      }
    }
  };

  return (
      <div>
        <Header userRole={userRole} isLoggedIn={isLoggedIn} onLogout={onLogout}/>

        <Routes>
          {/* Admin Login Route */}
          <Route path="/" element={<AdminLoginForm setUserRole={setUserRole} setIsLoggedIn={setIsLoggedIn}/>} />
          
          {/* User Login Route */}
          <Route path="/user/login" element={<UserLoginForm setUserRole={setUserRole} />} />

          {/* Admin Dashboard (protected by role check) */}
          <Route path="/admin/dashboard" element={userRole === 'admin' && isLoggedIn ? <AdminDashboard /> : <Navigate to="/" />} >
            <Route path="add-product" element={<AdminAddProduct />} />
          </Route>

          {/* User Orders page (accessible by regular user only) */}
          <Route path="/user/orders" element={userRole === 'user' && isLoggedIn ? <UserOrders /> : <Navigate to="/" />} />
          <Route path='/profile' element={<UserProfile />} />
        </Routes>
      </div>
  );
}

export default App;
