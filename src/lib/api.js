const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchProducts(params = {}, returnFullRes = false) {
  try {
    const query = new URLSearchParams(params).toString();
    let url = `${API_URL}/api/products${query ? `?${query}` : ""}`;
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        url = `http://127.0.0.1:5024/api/products${query ? `?${query}` : ""}`;
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
        url = `http://127.0.0.1:5024/api/products/${id}`; // Fix Node fetch IPv6 and .env issues
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
    credentials: "include",
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function verifyOtp(data) {
  const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function loginWithGoogle(credential) {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

let refreshPromise = null;

export async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise;
  }
  
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Session refresh failed");
      return await res.json();
    } finally {
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

let isInterceptorSetup = false;

export function setupFetchInterceptor(setToken, logoutFn) {
  if (typeof window === "undefined" || isInterceptorSetup) return;
  isInterceptorSetup = true;

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    let [resource, config] = args;
    
    let response = await originalFetch(resource, config);
    
    if (response.status === 401 && typeof resource === 'string' && 
        !resource.includes('/api/auth/refresh') && 
        !resource.includes('/api/auth/login') && 
        !resource.includes('/api/auth/logout')) {
      try {
        const refreshData = await refreshSession();
        
        if (refreshData && refreshData.success && refreshData.token) {
          const newToken = refreshData.token;
          setToken(newToken);
          
          const newConfig = { ...config };
          newConfig.headers = {
            ...newConfig.headers,
            'Authorization': `Bearer ${newToken}`
          };
          
          return await originalFetch(resource, newConfig);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (err) {
        console.error("Session expired, logging out.", err);
        logoutFn();
        return response;
      }
    }
    
    return response;
  };
}
