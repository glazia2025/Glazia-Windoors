import React, { useRef, useState } from "react";
import { MDBContainer } from "mdb-react-ui-kit";
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
  const sendOtp = async event => { event?.preventDefault(); setMessage(""); setBusy(true); try { await api.post("/auth/admin/send-otp", { phoneNumber: phoneNumber.trim() }); setStep("otp"); } catch (error) { setMessage(getApiErrorMessage(error, "send the admin OTP")); } finally { setBusy(false); } };
  const verify = async event => { event.preventDefault(); setMessage(""); setBusy(true); try { const response = await api.post("/auth/admin/verify-otp", { phoneNumber: phoneNumber.trim(), otp: otp.join("") }); localStorage.setItem("authToken", response.data.token); setCurrentAdminPermissions(response.data.admin?.permissions || []); const session = jwtDecode(response.data.token); setUserRole(session.role); setIsLoggedIn(true); navigate(firstAllowedAdminPath(), { replace: true }); } catch (error) { setMessage(getApiErrorMessage(error, "verify the admin OTP")); } finally { setBusy(false); } };
  const changeDigit = (index, value) => { const digit = value.replace(/\D/g, "").slice(-1); const next = [...otp]; next[index] = digit; setOtp(next); if (digit && index < 5) inputs.current[index + 1]?.focus(); };
  const pasteOtp = event => { const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split(""); if (!digits.length) return; event.preventDefault(); setOtp(Array.from({ length: 6 }, (_, index) => digits[index] || "")); inputs.current[Math.min(digits.length, 6) - 1]?.focus(); };
  return <MDBContainer fluid className="admin-otp-page"><section className="admin-otp-card"><div className="admin-otp-visual"><img src="/Assets/Images/admin.svg" alt=""/><span>GLAZIA WINDOORS</span><h1>Secure operations access</h1><p>Individual accounts, OTP verification and permission-based access for every administrator.</p></div><div className="admin-otp-form"><span className="admin-login-kicker">ADMIN PORTAL</span><h2>{step === "phone" ? "Sign in with OTP" : "Verify your number"}</h2><p>{step === "phone" ? "Enter the mobile number assigned to your admin account." : `We sent a 6-digit OTP to ${phoneNumber}.`}</p>{message && <div className="admin-login-error">{message}</div>}{step === "phone" ? <form onSubmit={sendOtp}><label>Mobile number</label><div className="admin-phone-input"><span>+91</span><input autoFocus required inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number"/></div><button disabled={busy || phoneNumber.length !== 10}>{busy ? "Sending…" : "Send OTP"}</button></form> : <form onSubmit={verify}><label>One-time password</label><div className="admin-otp-digits" onPaste={pasteOtp}>{otp.map((digit, index) => <input key={index} ref={element => { inputs.current[index] = element; }} autoFocus={index === 0} inputMode="numeric" maxLength="1" value={digit} onChange={event => changeDigit(index, event.target.value)} onKeyDown={event => { if (event.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus(); }}/>)}</div><button disabled={busy || otp.join("").length !== 6}>{busy ? "Verifying…" : "Verify and sign in"}</button><div className="admin-login-links"><button type="button" onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setMessage(""); }}>Change number</button><button type="button" onClick={sendOtp}>Resend OTP</button></div></form>}</div></section></MDBContainer>;
}
