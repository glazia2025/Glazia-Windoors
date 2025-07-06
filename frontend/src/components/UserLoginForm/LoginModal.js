import React, { useState } from 'react';
import { MDBModal, MDBModalDialog, MDBModalContent, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import OTPInput from "../OTPInput/OTPInput";
import UserDetailsForm from "../UserDetailsForm/UserDetailsForm";
import { useDispatch } from "react-redux"; // Import useDispatch
import { setUser } from "../../redux/userSlice"; // Import setUser action
import api from "../../utils/api";

import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

const LoginModal = ({ showModal, setShowModal, setUserRole }) => {

    
      const [phoneNumber, setPhoneNumber] = useState("");
      const [otp, setOtp] = useState("");
      const [isOtpSent, setIsOtpSent] = useState(false);
      const [message, setMessage] = useState("");
      const [errorMessage, setErrorMessage] = useState("");
      const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);

    const navigate = useNavigate();
  const dispatch = useDispatch();

const sendOtp = async () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      const response = await api.post("/auth/send-otp", { phoneNumber });
      setMessage(response.data.message);
      setIsOtpSent(true);
      setErrorMessage("");
    } catch (error) {
      console.log("error", error);
      setMessage("");
      setErrorMessage("Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = async (otp) => {
    setOtp(otp);
    if (!otp) {
      setErrorMessage("Please enter the OTP.");
      return;
    }

    try {
      const response = await api.post("/auth/verify-otp", { phoneNumber, otp });
      const { userExists, token, existingUser } = response.data;
      setMessage(response.data.message);

      if (!userExists) {
        // If user doesn't exist, show the user details form
        setShowUserDetailsForm(true);
      } else if (userExists) {
        const decoded = JSON.parse(atob(response.data?.token.split(".")[1]));
        setUserRole(decoded.role);
        dispatch(setUser(existingUser));
        // Navigate to orders if user exists
        localStorage.setItem("authToken", response.data?.token);
        navigate("/user/home");
      }
    } catch (error) {
      setMessage("");
      setErrorMessage("Invalid OTP. Please try again.");
    }
  };

    return (
        <MDBModal className="bottom-sheet-modal" open={showModal} onClose={() => setShowModal(false)}>
           {!showUserDetailsForm ? (
             <MDBModalDialog >
               <MDBModalContent>
                 <h2 className="mb-4">Please login to proceed</h2>
                 {isOtpSent ? (
                   <OTPInput verifyOtp={verifyOtp} sendOtp={sendOtp} />
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
               </MDBModalContent>
             </MDBModalDialog>
           ) : (
             <UserDetailsForm receivedPhoneNumber={phoneNumber} />
           )}
    </MDBModal>
    )
};

export default LoginModal;