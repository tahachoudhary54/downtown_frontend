'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { signup, verifyOtp, resendOtp, loginWithGoogle } from "../../lib/api";
import { GoogleLogin } from "@react-oauth/google";

import styles from "../auth.module.css";




export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState(1); // 1 = signup, 2 = otp
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  
  const router = useRouter();
  const { loginState } = useAuth();
  const { addNotification } = useNotifications();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
        // Call signup API
        const res = await signup({ name, email, password });
        // After signup response, capture preview URL if present
        if (res.success) {
          setSuccess(res.message);
          setStep(2);
          if (res.previewUrl) {
            // Show preview link for dev environment

          }
        } else {
          setError(res.message || "Failed to create account");
        }
       } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        loginState(res.token, res.user);
        // Notify admin about new Google signup (skip admin users)
        if (res.user.role !== 'admin') {
          addNotification({
            title: 'New User Registered',
            desc: `${res.user.name} (${res.user.email}) just created an account via Google.`,
            type: 'user',
          });
        }
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
        setError(res.message || "Google signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred during Google signup.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setResendMessage("");
      const res = await resendOtp(email);
      if (res.success) {
        setResendMessage(res.message || "OTP resent successfully");
      } else {
        setResendMessage(res.message || "Failed to resend OTP");
      }
    } catch (err) {
      setResendMessage("An error occurred while resending OTP");
    } finally {
      setResendLoading(false);
      // Start 60‑second cooldown
      setResendCooldown(60);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Using otp state directly
    try {
      const res = await verifyOtp({ email, otp });
      if (res.success) {
        loginState(res.token, res.user);
        // Notify admin about new verified signup
        addNotification({
          title: 'New User Registered',
          desc: `${res.user.name} (${res.user.email}) just created and verified their account.`,
          type: 'user',
        });
        const redirectUrl = sessionStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterAuth');
          router.push(redirectUrl);
        } else {
          router.push("/"); // redirect to home after successful login
        }
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
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
        {step === 1 ? (
          <>
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
                width="100%"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.9rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            </div>

            <form className={styles.form} onSubmit={handleSignupSubmit}>
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
                  disabled={loading}
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
                  disabled={loading}
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={loading}>
                {loading ? "PROCESSING..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <div className={styles.footer}>
              Already have an account? 
              <Link href="/login" className={styles.link}>
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Verify Email</h1>
            <p className={styles.subtitle}>We've sent a 6-digit code to <strong>{email}</strong></p>

            {success && <div style={{ color: '#27ae60', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{success}</div>}
            {error && <div style={{ color: '#c0392b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

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


              {/* Resend OTP button */}
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
            </form>
          </>
        )}
      </div>
    </div>
  );
}
