import React, { useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../../utils/api";
import { firstAllowedAdminPath, setCurrentAdminPermissions } from "../../utils/adminAccess";
import "./AdminLoginForm.css";

export default function AdminLoginForm({ setUserRole, setIsLoggedIn }) {
  const [step, setStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();

  const sendOtp = async (event) => {
    event?.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      await api.post("/auth/admin/send-otp", { phoneNumber: phoneNumber.trim() });
      setStep("otp");
    } catch (error) {
      setMessage(getApiErrorMessage(error, "send the admin OTP"));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const response = await api.post("/auth/admin/verify-otp", {
        phoneNumber: phoneNumber.trim(),
        otp: otp.join(""),
      });
      localStorage.setItem("authToken", response.data.token);
      setCurrentAdminPermissions(response.data.admin?.permissions || []);
      const session = jwtDecode(response.data.token);
      setUserRole(session.role);
      setIsLoggedIn(true);
      navigate(firstAllowedAdminPath(), { replace: true });
    } catch (error) {
      setMessage(getApiErrorMessage(error, "verify the admin OTP"));
    } finally {
      setBusy(false);
    }
  };

  const changeDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  };

  const pasteOtp = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    event.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, index) => digits[index] || ""));
    inputs.current[Math.min(digits.length, 6) - 1]?.focus();
  };

  return (
    <div className="clean-login-viewport">
      <div className="clean-login-card">
        {/* Left Side: Architectural Showcase */}
        <div className="clean-image-pane">
          <img
            src="/Assets/Images/login_facade.jpg"
            alt="Glazia Architectural Systems"
            className="clean-pane-img"
          />
          <div className="clean-pane-overlay"></div>

          <div className="clean-pane-content">
            <h1 className="clean-pane-title">
              Precision in Every <span className="clean-title-light">Frame.</span>
            </h1>
            <p className="clean-pane-subtitle">
              Architectural aluminium systems engineered for elegance, durability, and seamless living.
            </p>

            <div className="clean-pane-tags">
              <span className="pane-tag-lead">
                <i className="fas fa-compass me-1"></i> Glazia
              </span>
              <span className="pane-tag"># Sliding Systems</span>
              <span className="pane-tag"># Thermal Profiles</span>
              <span className="pane-tag"># Hardware</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Monochromatic Form */}
        <div className="clean-form-pane">
          <div className="clean-top-bar">
            {step === "otp" ? (
              <button
                type="button"
                className="clean-back-circle"
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setMessage("");
                }}
                title="Back to mobile number"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            ) : (
              <div className="clean-brand-pill">
                <img src="/123.png" alt="Glazia" className="clean-brand-mini-logo" />
              </div>
            )}
          </div>

          <div className="clean-form-body">
            <h2 className="clean-form-title">Welcome back</h2>
            <p className="clean-form-sub">
              {step === "phone"
                ? "Enter your mobile number to receive a secure login OTP."
                : `We've sent a 6-digit verification code to +91 ${phoneNumber}`}
            </p>

            {message && (
              <div className="clean-alert-error">
                <i className="fas fa-exclamation-circle me-2"></i>
                <span>{message}</span>
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={sendOtp} className="clean-interactive-form">
                <div className="clean-field-wrap">
                  <label className="clean-label">Mobile Number</label>
                  <div className="clean-input-box">
                    <span className="clean-country-code">+91</span>
                    <input
                      autoFocus
                      required
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      className="clean-text-input"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(event) =>
                        setPhoneNumber(event.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy || phoneNumber.length !== 10}
                  className="clean-action-btn"
                >
                  {busy ? "Sending OTP..." : "Log In"}
                </button>

                <p className="clean-form-footnote">
                  Access is restricted to authorized administrators only.
                </p>
              </form>
            ) : (
              <form onSubmit={verify} className="clean-interactive-form">
                <div className="clean-field-wrap">
                  <label className="clean-label">Enter One-Time Password</label>
                  <div className="clean-otp-grid" onPaste={pasteOtp}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          inputs.current[index] = element;
                        }}
                        autoFocus={index === 0}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        className={`clean-otp-input ${digit ? "filled" : ""}`}
                        value={digit}
                        onChange={(event) => changeDigit(index, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Backspace" && !otp[index] && index > 0) {
                            inputs.current[index - 1]?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy || otp.join("").length !== 6}
                  className="clean-action-btn"
                >
                  {busy ? "Verifying..." : "Verify and Continue"}
                </button>

                <div className="clean-sub-actions">
                  <button
                    type="button"
                    className="clean-link-button"
                    onClick={() => {
                      setStep("phone");
                      setOtp(["", "", "", "", "", ""]);
                      setMessage("");
                    }}
                  >
                    Change mobile number
                  </button>
                  <button
                    type="button"
                    className="clean-link-button"
                    disabled={busy}
                    onClick={sendOtp}
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
