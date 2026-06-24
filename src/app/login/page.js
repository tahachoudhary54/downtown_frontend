'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { login, verifyOtp, resendOtp, loginWithGoogle } from "../../lib/api";
import { GoogleLogin } from "@react-oauth/google";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Password
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  const router = useRouter();
  const { loginState } = useAuth();
  const { addNotification } = useNotifications();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // Step 1: Send only email
      const res = await login({ email });
      if (res.success) {
        if (res.requiresPassword) {
          // It's an admin!
          setStep(3);
        } else if (res.requiresOtp) {
          // It's a customer!
          setSuccess(res.message);
          setStep(2);
        }
      } else {
        setError(res.message || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await login({ email, password });
      if (res.success && res.token) {
        loginState(res.token, res.user);
        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterAuth');
          router.push(redirectUrl);
        } else if (res.user.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await verifyOtp({ email, otp });
      if (res.success) {
        loginState(res.token, res.user);
        
        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterAuth');
          router.push(redirectUrl);
        } else {
          router.push("/");
        }
      } else {
        setError(res.message || "Invalid verification code");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setResendMessage("");
      const res = await resendOtp(email);
      if (res.success) {
        setResendMessage(res.message || "Code resent successfully");
      } else {
        setResendMessage(res.message || "Failed to resend code");
      }
    } catch (err) {
      setResendMessage("An error occurred while resending");
    } finally {
      setResendLoading(false);
      setResendCooldown(60);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        loginState(res.token, res.user);
        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterAuth');
          router.push(redirectUrl);
        } else if (res.user.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(res.message || "Google login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred during Google login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <div className={styles.page}>
      <div className={styles.authContainer}>
        <h1 className={styles.title}>
          {step === 1 ? "Welcome Back" : (step === 2 ? "Verify Email" : "Admin Login")}
        </h1>
        <p className={styles.subtitle}>
          {step === 1 
            ? "Sign in or create an account" 
            : (step === 2 ? `We've sent a code to ${email}` : `Enter your password for ${email}`)}
        </p>

        {success && <div style={{ color: '#27ae60', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{success}</div>}
        {error && <div style={{ color: '#c0392b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        {step === 1 && (
          <>
            <div className={styles.googleBtnWrapper} style={{ marginBottom: '1.5rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError("Google login failed");
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

            <form className={styles.form} onSubmit={handleEmailSubmit}>
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
                  disabled={loading}
                />
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? "PROCESSING..." : "CONTINUE"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <form className={styles.form} onSubmit={handleOtpSubmit}>
            <div className={styles.otpCard}>
              <div className={styles.inputGroup}>
                <label htmlFor="otp" className={styles.label}>VERIFICATION CODE</label>
                <input
                  type="text"
                  id="otp"
                  className={`${styles.input} ${styles.otpInput}`}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>
            </div>

            <div className={styles.resendContainer} style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <button
                type="button"
                className={styles.btnResend}
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendLoading ? "RESENDING..." : (resendCooldown > 0 ? `RESEND CODE (${resendCooldown}s)` : "RESEND CODE")}
              </button>
              {resendMessage && <div style={{ marginTop: '0.5rem', color: '#27ae60' }}>{resendMessage}</div>}
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "VERIFYING..." : "VERIFY & LOGIN"}
            </button>
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setStep(1); setError(""); setSuccess(""); }} 
                className={styles.link} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>PASSWORD</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
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
              {loading ? "VERIFYING..." : "LOGIN AS ADMIN"}
            </button>
            
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setStep(1); setError(""); setSuccess(""); setPassword(""); }} 
                className={styles.link} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
