/* src/context/WishlistContext.jsx */
"use client";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import WishlistToast from '../components/WishlistToast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const WishlistContext = createContext({
  wishlist: [],
  isWishlisted: () => false,
  toggleWishlist: () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  showToast: () => {},
});

export const WishlistProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {}
      }
    }
    return [];
  });

  const triggerToast = (message, subtitle = '', type = 'add') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ id: Date.now(), message, subtitle, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  // Sync with MongoDB when user logs in or mounts with token
  const prevTokenRef = useRef(null);
  useEffect(() => {
    if (!token) {
      prevTokenRef.current = null;
      return;
    }

    const syncWithBackend = async () => {
      try {
        // If transitioning from guest to logged in, merge local storage items first
        const isNewLogin = prevTokenRef.current !== token;
        prevTokenRef.current = token;

        if (isNewLogin) {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('wishlist') : null;
          const localItems = stored ? JSON.parse(stored) : [];
          
          if (localItems.length > 0) {
            const mergeRes = await fetch(`${API_URL}/api/users/me/wishlist/merge`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ guestWishlist: localItems })
            });
            if (mergeRes.ok) {
              const mergeData = await mergeRes.json();
              if (mergeData.success && mergeData.data) {
                setWishlist(mergeData.data);
                return;
              }
            }
          }
        }

        // Fetch user's DB wishlist
        const res = await fetch(`${API_URL}/api/users/me/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setWishlist(data.data);
          }
        }
      } catch (err) {
        console.error("Error syncing wishlist with backend:", err);
      }
    };

    syncWithBackend();
  }, [token]);

  // Persist changes to localStorage and MongoDB (if authenticated)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlist-updated'));
    }

    if (token) {
      const saveToBackend = async () => {
        try {
          await fetch(`${API_URL}/api/users/me/wishlist`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ wishlist })
          });
        } catch (err) {
          console.error("Error saving wishlist to backend:", err);
        }
      };
      saveToBackend();
    }
  }, [wishlist, token]);

  // Listen for storage changes across tabs and same-tab custom events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncWishlist = () => {
      try {
        const stored = localStorage.getItem('wishlist');
        const parsed = stored ? JSON.parse(stored) : [];
        setWishlist((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
          return parsed;
        });
      } catch (_) {}
    };

    const handleStorageChange = (e) => {
      if (e.key === 'wishlist' || !e.key) {
        syncWishlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wishlist-updated', syncWishlist);
    window.addEventListener('focus', syncWishlist);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlist-updated', syncWishlist);
      window.removeEventListener('focus', syncWishlist);
    };
  }, []);

  const getProductId = (item) => {
    if (!item) return null;
    if (typeof item === 'string' || typeof item === 'number') return item.toString();
    const id = item._id || item.id;
    return id ? id.toString() : null;
  };

  const isSameProduct = (p1, p2) => {
    const id1 = getProductId(p1);
    const id2 = getProductId(p2);
    return id1 && id2 && id1 === id2;
  };

  const isWishlisted = (target) => {
    const targetId = getProductId(target);
    if (!targetId) return false;
    return wishlist.some((p) => getProductId(p) === targetId);
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => isSameProduct(p, product));
      if (exists) {
        triggerToast("Removed from Wishlist", product.name, "remove");
        return prev.filter((p) => !isSameProduct(p, product));
      }
      triggerToast("Added to your Wishlist", product.name, "add");
      return [...prev, product];
    });
  };

  const addToWishlist = (items, customToastSubtitle = null) => {
    const productsToAdd = Array.isArray(items) ? items : [items];
    setWishlist((prev) => {
      const newItems = productsToAdd.filter(
        (newP) => !prev.some((p) => isSameProduct(p, newP))
      );
      if (newItems.length === 0) {
        triggerToast("Already in Wishlist", customToastSubtitle || `${productsToAdd.length} product(s) in your wishlist`, "add");
        return prev;
      }
      const msg = newItems.length === 1 ? "Added to your Wishlist" : `Added ${newItems.length} items to Wishlist`;
      const sub = customToastSubtitle || (newItems.length === 1 ? newItems[0].name : `${newItems.length} products saved`);
      triggerToast(msg, sub, "add");
      return [...prev, ...newItems];
    });
  };

  const removeFromWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => isSameProduct(p, product));
      if (exists) {
        triggerToast("Removed from Wishlist", product.name, "remove");
        return prev.filter((p) => !isSameProduct(p, product));
      }
      return prev;
    });
  };

  const value = { wishlist, isWishlisted, toggleWishlist, addToWishlist, removeFromWishlist, showToast: triggerToast };
  return (
    <WishlistContext.Provider value={value}>
      {children}
      <WishlistToast toast={toast} />
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
