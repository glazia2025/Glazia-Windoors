import React, { useState } from 'react';
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox
}
from 'mdb-react-ui-kit';
import axios from 'axios';
import './AdminLoginForm.css';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AdminLoginForm = ({ setUserRole, setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/admin/login', { username, password });

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
    <MDBContainer fluid className="p-3 my-5 mdb-container">
      <MDBRow>
        <MDBCol col='10' md='6'>
          <img src="/Assets/Images/admin.svg" class="img-fluid admin-img" alt="Phone image" />
        </MDBCol>
        <MDBCol col='4' md='6'>
          <h1 className='mb-4'>Admin Login</h1>
          <MDBInput value={username} wrapperClass='mb-4' label='Username' id='formControlLg' type='text' size="lg" onChange={(e) => setUsername(e.target.value)}/>
          <MDBInput value={password} wrapperClass='mb-4' label='Password' id='formControlLg' type='password' size="lg" onChange={(e) => setPassword(e.target.value)}/>

          <MDBBtn className="mb-4 w-100" size="lg" onClick={handleLogin}>Sign in</MDBBtn>

          {message && <p>{message}</p>}

        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default AdminLoginForm;
