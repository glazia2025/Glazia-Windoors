import React, { useState, useEffect } from 'react';
import './OTPInput.css'; // Add necessary styles
import { MDBBtn, MDBCardText, MDBIcon } from 'mdb-react-ui-kit';

const OTPInput = ({ verifyOtp, sendOtp }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(3); // Countdown timer in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false); // Enable resend button when timer reaches 0
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]*$/.test(value)) return; // Allow only numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Ensure only one digit per box
    setOtp(newOtp);

    // Focus next box if value is entered
    if (value && index < 5) {
      document.getElementById(`otp-box-${index + 1}`).focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === 'Enter' && otp.join("").length === 6) {
      verifyOtp(otp.join(""));
    }
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-box-${index - 1}`).focus();
    }
  };

  const handleSubmit = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      verifyOtp(otpValue); // Trigger submit function
    } else {
      alert("Please fill in all 6 digits.");
    }
  };

  const handleResendOtp = () => {
    setIsResendDisabled(true);
    setTimer(30); // Reset countdown timer
    sendOtp(); // Call the resend function
  };

  return (
    <div className="otp-container">
      <div className="otp-input-boxes">
        {otp.map((digit, index) => (
          <input
            size="lg"
            key={index}
            id={`otp-box-${index}`}
            type="number"
            className="otp-box"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleBackspace(e, index)}
          />
        ))}
      </div>
      <MDBBtn className="w-100 mb-3" size="lg" onClick={handleSubmit}>
        Verify OTP
      </MDBBtn>
      
      {/* Resend OTP button with timer */}
      <div className="resend-otp-container">
        {isResendDisabled ? (
          <p className="timer-text">Resend OTP in {timer}s</p>
        ) : (
          <MDBCardText style={{cursor: 'pointer', color: '#3b71ca'}} className="w-100" size="lg" onClick={handleResendOtp}>
            <MDBIcon fas icon="redo-alt" /> Resend OTP
          </MDBCardText>
        )}
      </div>
    </div>
  );
};

export default OTPInput;
