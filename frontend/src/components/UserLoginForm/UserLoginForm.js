import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import './UserLoginForm.css';
import OTPInput from '../OTPInput/OTPInput';
import UserDetailsForm from '../UserDetailsForm/UserDetailsForm';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { setUser } from '../../redux/userSlice'; // Import setUser action
import api from '../../utils/api';
import loginImage from '../../login_theme.svg';

const MobileLoginForm = ({ setUserRole }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sendOtp = async () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      const response = await api.post('/auth/send-otp', { phoneNumber });
      setMessage(response.data.message);
      setIsOtpSent(true);
      setErrorMessage('');
    } catch (error) {
      setMessage('');
      setErrorMessage('Failed to send OTP. Please try again.');
    }
  };

  const verifyOtp = async (otp) => {
    setOtp(otp)
    if (!otp) {
      setErrorMessage('Please enter the OTP.');
      return;
    }

    try {
      const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
      const { userExists, token, existingUser } = response.data;
      setMessage(response.data.message);

      if (!userExists) {
        // If user doesn't exist, show the user details form
        setShowUserDetailsForm(true);
      } else if (userExists){

        const decoded = JSON.parse(atob(response.data?.token.split('.')[1]));
        setUserRole(decoded.role);
        dispatch(setUser(existingUser));
        // Navigate to orders if user exists
        localStorage.setItem('authToken', response.data?.token);
        navigate('/user/orders');
      }
    } catch (error) {
      setMessage('');
      setErrorMessage('Invalid OTP. Please try again.');
    }
  };

  return (
    <MDBContainer fluid className="mdb-container">
      <MDBRow>
        <MDBCol md='7' className='text-center text-md-start d-flex flex-column justify-content-center'>
            <img 
              src={loginImage} 
              alt="Login Theme" 
              className="img-fluid mb-4 login-image align-items-center" 
              style={{ maxWidth: '100%', height: 'auto' }} 
            />
            <h1 className="my-5 display-3 fw-bold ls-tight px-3">
            The best offer <br />
            <span className="text-primary">for your business</span>
            </h1>

            <p className='px-3' style={{color: 'hsl(217, 10%, 50.8%)'}}>
                Our platform connects you directly with trusted suppliers, ensuring you get the raw materials you need, when you need them. With our easy-to-use system, manufacturers can efficiently manage orders, track deliveries, and optimize their supply chain—all in one place.
            </p>

        </MDBCol>
        {!showUserDetailsForm ? (
          <MDBCol className='otp-login-system' md="5">
          <MDBCard className="my-5">
          <MDBCardBody>
                  <h2 className="mb-4">Please login to proceed</h2>
                  {isOtpSent ? (
                    <OTPInput verifyOtp={verifyOtp} />
                  ) : (
                    <>
                      <MDBInput
                        size="lg"
                        wrapperClass="mb-4"
                        label="Mobile Number"
                        id="phoneNumberInput"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <MDBBtn className="w-100 mb-46" size="lg" onClick={sendOtp}>
                        Send OTP
                      </MDBBtn>
                    </>
                  )}
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                {message && <p className="text-success">{message}</p>}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        ) : <UserDetailsForm receivedPhoneNumber={phoneNumber}/>}
      </MDBRow>
    </MDBContainer>
  );
};

export default MobileLoginForm;
