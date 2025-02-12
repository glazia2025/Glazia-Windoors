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
import logo from '../../Glazia.png';

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
      <MDBRow  className="login-main-wrapper" style={{gap: '20px', justifyContent: 'space-between'}}>
        {/* Left Content Section */}
        <MDBCol md="7" className='text-center text-md-start d-flex flex-column justify-content-center'>
          <div className='logo-alignment d-flex align-items-center'>
            <img className='glazia-logo' src={logo}/>
            <h3 className="my-5 display-4 fw-bold ls-tight" style={{marginLeft: '20px'}}>
              Glazia – The Future of Facade & Fenestration Procurement
            </h3>
          </div>

          <p style={{color: 'hsl(217, 10%, 50.8%)'}}>
            Your One-Stop Platform for Aluminium, Glass & Hardware
          </p>

          <p style={{color: 'hsl(217, 10%, 50.8%)'}}>
            Glazia is a tech-enabled aggregator revolutionizing the facade and fenestration industry. We simplify raw material procurement by bringing Aluminium Profiles, Hardware, and Accessories onto a single platform—ensuring cost efficiency, faster deliveries, and superior quality for fabricators and businesses.
          </p>

          <h5>Why Glazia?</h5>
          <ul className='why-glazia'>
            <li>✔ Comprehensive Product Range – Order Aluminium Profiles with your preferred finish (Powder Coating, Anodizing, PVDF Coating), along with hardware, accessories, and glass—all in one place.</li>
            <li>✔ Reduced Costs, Faster Delivery – Our streamlined supply chain eliminates inefficiencies, saving you time and money.</li>
            <li>✔ Tech-Driven Convenience – A digital-first approach enables seamless order tracking, transparent pricing, and hassle-free procurement.</li>
            <li>✔ Guaranteed Quality – We partner with top manufacturers to provide standardized, high-performance materials that meet global benchmarks.</li>
          </ul>

          <h5>Partner with Glazia Today!</h5>
          <p>📞 Call Us: +91 9958053708</p>
          <p>📍 Location: Manesar, Gurgaon</p>
          <p>📩 Email: glazia.in@gmail.com</p>
          <p>🚀 Glazia – Your Gateway to Faster, Smarter, and Cost-Effective Facade Solutions</p>
        </MDBCol>

        {/* Right Content (Login Form) Section */}
        <MDBCol className='otp-login-system' md="4">
            {/* <img 
              src={loginImage} 
              alt="Login Theme" 
              className="img-fluid mb-4 login-image align-items-center" 
              style={{ maxWidth: '100%', height: 'auto' }} 
            /> */}
          {!showUserDetailsForm ? (
            <MDBCard className="login-card my-5">
              
              <MDBCardBody>
                <h2 className="mb-4">Please login to proceed</h2>
                {isOtpSent ? (
                  <OTPInput verifyOtp={verifyOtp} sendOtp={sendOtp}/>
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendOtp(); // Trigger OTP send on Enter key press
                        }
                      }}
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
          ) : <UserDetailsForm receivedPhoneNumber={phoneNumber}/>}
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default MobileLoginForm;
