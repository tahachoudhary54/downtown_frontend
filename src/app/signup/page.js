'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { signup, verifyOtp, resendOtp, loginWithGoogle } from "../../lib/api";
import { GoogleLogin } from "@react-oauth/google";
import styles from "../auth.module.css";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const router = useRouter();
  const { loginState } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signup({ name, email, password });
      if (res.success) {
        setStep(2);
      } else {
        setError(res.message || "Failed to sign up");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await verifyOtp({ email, otp });
      if (res.success) {
        loginState(res.token, res.user);
        router.push("/");
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResendMessage("");
    setResendLoading(true);
    try {
      const res = await resendOtp(email);
      if (res.success) {
        setResendMessage("A new verification code has been sent.");
      } else {
        setError(res.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred while resending OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        loginState(res.token, res.user);
        router.push("/");
      } else {
        setError(res.message || "Google signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred during Google signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.authContainer}>
        {step === 1 ? (
          <>
            <div className={styles.topTabs}>
              <Link href="/login" className={styles.tabBtn}>LOGIN</Link>
              <Link href="/signup" className={`${styles.tabBtn} ${styles.activeTab}`}>SIGN UP</Link>
            </div>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Join Downtown Boutique today</p>

            {error && <div style={{ color: '#c0392b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

            <div className={styles.googleBtnWrapper} style={{ marginBottom: '1.5rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError("Google signup failed");
                }}
                shape="rectangular"
                theme="outline"
                text="continue_with"
                size="large"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.9rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            </div>

            <form className={styles.form} onSubmit={handleSignup}>
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>FULL NAME</label>
                <input
                  type="text"
                  id="name"
                  className={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
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

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>PASSWORD</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={styles.input}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 className={styles.title}>Verify Email</h1>
            <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>We've sent a 6-digit code to {email}</p>

            {error && <div style={{ color: '#c0392b', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            {resendMessage && <div style={{ color: '#27ae60', marginBottom: '1rem', fontSize: '0.9rem' }}>{resendMessage}</div>}

            <form className={styles.form} onSubmit={handleVerifyOtp}>
              <div className={styles.inputGroup}>
                <label htmlFor="otp" className={styles.label} style={{ textAlign: 'left' }}>VERIFICATION CODE</label>
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

              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? "VERIFYING..." : "VERIFY CODE"}
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
                ← Back to sign up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
