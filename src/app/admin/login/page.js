'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import { GoogleLogin } from "@react-oauth/google";
import styles from "../../auth.module.css";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginState } = useAdminAuth();



  return (
    <div className={styles.page}>
      <div className={styles.authContainer}>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>Sign in to access the control panel</p>

        {error && <div style={{ color: '#c0392b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <div className={styles.googleBtnWrapper} style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setError("");
              setLoading(true);
              try {
                // We need to import loginWithGoogle from api.js if it's not already, wait, I didn't import it!
                // I will add the import at the top of the file in another chunk.
                const { loginWithGoogle } = require('../../../lib/api');
                const res = await loginWithGoogle(credentialResponse.credential, "admin");
                if (res.success) {
                  loginState(res.token, res.user);
                  const redirectUrl = sessionStorage.getItem('redirectAfterAdminAuth');
                  if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterAdminAuth');
                    router.push(redirectUrl);
                  } else {
                    router.push("/admin");
                  }
                } else {
                  setError(res.message || "Access denied. Admin only.");
                }
              } catch (err) {
                setError("An unexpected error occurred.");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError("Google login failed");
            }}
            shape="rectangular"
            theme="outline"
            text="continue_with"
            size="large"
          />
        </div>
        {loading && <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Authenticating...</p>}

        <div className={styles.footer} style={{ marginTop: '1rem' }}>
          <Link href="/login" className={styles.link}>
            Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
