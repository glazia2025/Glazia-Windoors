import React, { useState } from 'react';
import './OTPInput.css'; // Add necessary styles
import { MDBBtn } from 'mdb-react-ui-kit';

const OTPInput = ({ verifyOtp }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));

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

  return (
    <div className="otp-container">
      <div className="otp-input-boxes">
        {otp.map((digit, index) => (
          <input
            size="lg"
            key={index}
            id={`otp-box-${index}`}
            type="text"
            className="otp-box"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleBackspace(e, index)}
          />
        ))}
      </div>
      <MDBBtn className="w-100 mb-4" size="lg" onClick={handleSubmit}>
        Verify OTP
      </MDBBtn>
    </div>
  );
};

export default OTPInput;
