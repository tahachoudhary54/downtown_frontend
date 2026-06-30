const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchProducts(params = {}, returnFullRes = false) {
  try {
    const query = new URLSearchParams(params).toString();
    let url = `${API_URL}/api/products${query ? `?${query}` : ""}`;
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        url = `http://127.0.0.1:5000/api/products${query ? `?${query}` : ""}`;
    }
    const res = await fetch(url, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (returnFullRes) return { products: data.data || [], categoryCounts: data.categoryCounts || {}, pagination: data.pagination || null };
      return data.data;
    }
  } catch (e) {
    // ignore fetch errors
  }
  // Fallback to static product list
  try {
    const { products } = require('../data/products');
    if (returnFullRes) return { products: products || [], categoryCounts: {}, pagination: null };
    return products || [];
  } catch (_) {
    if (returnFullRes) return { products: [], categoryCounts: {}, pagination: null };
    return [];
  }
}

export async function fetchProductById(id) {
  try {
    let url = `${API_URL}/api/products/${id}`;
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        url = `http://127.0.0.1:5000/api/products/${id}`; // Fix Node fetch IPv6 and .env issues
    }
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    } else {
      console.error("fetchProductById HTTP Error:", res.status, res.statusText);
    }
  } catch (e) {
    console.error("fetchProductById error:", e.message, e.cause);
  }
  // Fallback to static product list
  try {
    const { products } = require('../data/products');
    return products.find(p => p.id === id) || null;
  } catch (_) {
    return null;
  }
}

export async function signup(userData) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function verifyOtp(data) {
  const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function loginWithGoogle(credential) {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  return res.json();
}

export async function resendOtp(email) {
  const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPassword(data) {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
