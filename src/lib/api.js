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

export async function login(credentials, type = 'user') {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...credentials, loginType: type }),
  });
  return res.json();
}

export async function loginWithGoogle(credential, type = 'user') {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ credential, loginType: type }),
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

let refreshPromises = { user: null, admin: null };

export async function refreshSession(type = 'user', force = false) {
  if (refreshPromises[type]) {
    return refreshPromises[type];
  }
  
  // Cross-tab throttle: if another tab refreshed within the last 15 seconds, skip and return success implicitly.
  // This prevents strict token rotation anomaly (replay attack) from falsely logging out users who switch tabs quickly.
  if (!force && typeof window !== 'undefined') {
    const lastRefresh = localStorage.getItem(`lastRefresh_${type}`);
    if (lastRefresh && Date.now() - parseInt(lastRefresh, 10) < 15000) {
      return { success: true, message: "Throttled cross-tab refresh" };
    }
  }

  refreshPromises[type] = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh?type=${type}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        return { success: false, message: "Session refresh failed" };
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lastRefresh_${type}`, Date.now().toString());
      }
      return await res.json();
    } finally {
      refreshPromises[type] = null;
    }
  })();
  
  return refreshPromises[type];
}

export async function logout(type = 'user') {
  const res = await fetch(`${API_URL}/api/auth/logout?type=${type}`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

let isInterceptorSetup = false;
const authHandlers = {
  user: { setToken: null, logout: null },
  admin: { setToken: null, logout: null }
};

export function registerAuthHandlers(type, setToken, logoutFn) {
  authHandlers[type] = { setToken, logout: logoutFn };
  setupFetchInterceptor();
}

function setupFetchInterceptor() {
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
      
      let type = 'user';
      if (resource.includes('/api/admin')) {
        type = 'admin';
      } else if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        type = 'admin';
      }
      
      const handler = authHandlers[type];
      
      try {
        const refreshData = await refreshSession(type);
        
        if (refreshData && refreshData.success && refreshData.token) {
          const newToken = refreshData.token;
          if (handler && handler.setToken) handler.setToken(newToken);
          
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
        console.error(`Session expired for ${type}, logging out.`, err);
        if (handler && handler.logout) handler.logout();
        return response;
      }
    }
    
    return response;
  };
}
