import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import AdminLoginForm from './components/AdminLoginForm/AdminLoginForm';
import UserLoginForm from './components/UserLoginForm/UserLoginForm';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserOrders from './components/UserOrders';
import { jwtDecode } from "jwt-decode";
import AdminAddProduct from './components/AdminAddProduct';
import Header from './components/Header/Header';
import UserProfile from './components/UserProfile/UserProfile';
import { useSelector } from 'react-redux';
import SyncLoader from 'react-spinners/SyncLoader';
import Footer from './components/Footer';
import './App.css';
import SelectionContainer from './components/UserDashboard/SelectionContainer';
import AdminForm from './components/AdminDashboard/AdminForm';
import ExcelDataFetcher from './components/Excel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Orders from './components/AdminDashboard/Orders/Orders';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate(); 
  const isLoading = useSelector((state) => state.loader.isLoading);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const decoded = checkTokenExpiration();
  
    if (decoded) {
      setUserRole(decoded.role);
      setIsLoggedIn(true);
  
      if (isInitialLoad) {
        console.log("culrp");
        if (decoded.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/orders');
        }
        setIsInitialLoad(false);
      }
    } else {
      setIsLoggedIn(false);
      if (!isInitialLoad) {
        console.log("culp 2");
        
        navigate(localStorage.getItem('userRole') === 'admin' ? '/' : '/user/login');
      }
      setUserRole(null);

    }
  }, [navigate]);

  const setUserRole = (role) => {
    localStorage.setItem('userRole', role);
  }

  const onLogout = () => {
    setIsLoggedIn(false);
    setIsInitialLoad(true);
    localStorage.removeItem('authToken');
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('authToken');
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
  
        if (decoded.exp < currentTime) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
        } else {
          return decoded;
        }
      } catch (error) {
        console.error('Error decoding token', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
      }
    }
  };  

  return (
      <div style={{overflowX: 'hidden'}}>
        <ToastContainer
          style={{marginTop: '100px'}}
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
        <>
          {isLoading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}>
              <SyncLoader color="#123abc" />
            </div>
          )}
          {/* Your app content */}
        </>
        {isLoggedIn && localStorage.getItem('userRole') && <Header isLoggedIn={isLoggedIn} onLogout={onLogout}/>}
          <div className='app-container'>
            <Routes>
              {/* Admin Login Route */}
              {!isLoggedIn && (
                <>
                  <Route
                    path="/"
                    element={<AdminLoginForm setUserRole={setUserRole} setIsLoggedIn={setIsLoggedIn} />}
                  />
                  <Route
                    path="/user/login"
                    element={<UserLoginForm setUserRole={setUserRole} />}
                  />
                </>
              )}

              {/* Admin Dashboard (protected by role check) */}
              <Route path="/admin/dashboard" element={localStorage.getItem('userRole') === 'admin' && isLoggedIn ? <AdminDashboard /> : <Navigate to="/" />} >
              </Route>
              <Route path="/admin/dashboard/add-product" element={localStorage.getItem('userRole') === 'admin' && isLoggedIn ? <AdminForm /> : <Navigate to="/" />} />
              <Route path="/admin/dashboard/view-orders" element={localStorage.getItem('userRole') === 'admin' && isLoggedIn ? <Orders />:<Navigate to="/" />} />

              {/* User Orders page (accessible by regular user only) */}
              <Route path="/user/orders" element={localStorage.getItem('userRole') === 'user' && isLoggedIn ? <SelectionContainer /> : <Navigate to="/user/login" />} />
              <Route path='/profile' element={localStorage.getItem('userRole') === 'user' && isLoggedIn ? <UserProfile /> : <Navigate to="/user/login" />} />
            </Routes>
          </div>
        <Footer/>
      </div>
  );
}

export default App;
