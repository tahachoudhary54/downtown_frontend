'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { passwordlessRequest, passwordlessVerify, loginWithGoogle } from "../../lib/api";
import { GoogleLogin } from "@react-oauth/google";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();
  const { loginState } = useAuth();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email.");
    
    setError("");
    setLoading(true);
    try {
      const res = await passwordlessRequest(email);
      if (res.success) {
        setStep(2);
        setCooldown(60);
      } else {
        setError(res.message || "Failed to send verification code.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Please enter the verification code.");
    
    setError("");
    setLoading(true);
    try {
      const res = await passwordlessVerify({ email, otp });
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
        setError(res.message || "Invalid verification code.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await passwordlessRequest(email);
      if (res.success) {
        setCooldown(60);
      } else {
        setError(res.message || "Failed to resend code.");
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

  return (
    <div className={styles.page}>
      <div className={styles.authContainer}>
        <h1 className={styles.title}>Welcome</h1>
        <p className={styles.subtitle}>Sign in or create an account</p>

        {error && <div style={{ color: '#c0392b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        {step === 1 ? (
          <>
            <div className={styles.googleBtnWrapper} style={{ marginBottom: '1.5rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
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

            <form className={styles.form} onSubmit={handleRequestOtp}>
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
                {loading ? "SENDING..." : "CONTINUE WITH EMAIL"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>

            <form className={styles.form} onSubmit={handleVerifyOtp}>
              <div className={styles.inputGroup}>
                <label htmlFor="otp" className={styles.label}>VERIFICATION CODE</label>
                <input
                  type="text"
                  id="otp"
                  className={styles.input}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  disabled={loading}
                  style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem' }}
                />
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={loading || otp.length < 6}>
                {loading ? "VERIFYING..." : "VERIFY & LOGIN"}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.85rem' }}>
              <button 
                type="button" 
                onClick={() => { setStep(1); setOtp(""); setError(""); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Email
              </button>
              
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                style={{ background: 'none', border: 'none', color: cooldown > 0 ? '#94a3b8' : '#111', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: cooldown > 0 ? 'normal' : '600' }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
