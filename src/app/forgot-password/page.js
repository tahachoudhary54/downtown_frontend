'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotPassword, resetPassword } from "../../lib/api";
import styles from "../auth.module.css";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setStep(2);
        setSuccessMsg("Reset code sent to your email.");
      } else {
        setError(res.message || "Failed to send reset code.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await resetPassword({ email, otp, newPassword });
      if (res.success) {
        setStep(3); // Success step
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMsg("");
    setResendLoading(true);
    try {
      // Re-use forgotPassword API to send a new OTP
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccessMsg("A new reset code has been sent.");
      } else {
        setError(res.message || "Failed to resend code.");
      }
    } catch (err) {
      setError("An unexpected error occurred while resending.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.authContainer} style={{ maxWidth: '400px' }}>
        
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <h1 className={styles.title}>Forgot Password</h1>
            <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
              Enter your email address and we'll send you a code to reset your password.
            </p>

            {error && <div style={{ color: '#c0392b', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

            <form className={styles.form} onSubmit={handleRequestReset}>
              <div className={styles.inputGroup} style={{ textAlign: 'left' }}>
                <label htmlFor="email" className={styles.label}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? "SENDING CODE..." : "SEND RESET CODE"}
              </button>
            </form>
            
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/login" className={styles.link} style={{ fontSize: '0.9rem' }}>
                ← Back to Login
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle} style={{ marginBottom: '1.5rem' }}>
              Enter the 6-digit code sent to {email}
            </p>

            {error && <div style={{ color: '#c0392b', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            {successMsg && <div style={{ color: '#27ae60', marginBottom: '1rem', fontSize: '0.9rem' }}>{successMsg}</div>}

            <form className={styles.form} onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
              <div className={styles.inputGroup}>
                <label htmlFor="otp" className={styles.label}>RESET CODE</label>
                <input
                  type="text"
                  id="otp"
                  className={styles.input}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="newPassword" className={styles.label}>NEW PASSWORD</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    className={styles.input}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>
            
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={resendLoading}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
              >
                {resendLoading ? "Sending..." : "Didn't receive the code? Resend"}
              </button>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h1 className={styles.title} style={{ marginBottom: '1rem' }}>Password Reset</h1>
            <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
              Your password has been successfully reset.
            </p>
            <Link href="/login" className={styles.btnSubmit} style={{ display: 'inline-block', textDecoration: 'none' }}>
              CONTINUE TO LOGIN
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
