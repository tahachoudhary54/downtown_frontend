/* src/context/WishlistContext.jsx */
"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load persisted wishlist from localStorage (if any)
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('wishlist') : null;
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (_) {}
    }
  }, []);

  // Persist changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const isWishlisted = (id) => wishlist.some((p) => p._id === id || p.id === id);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const matches = (a, b) => a && b && a === b;
      const exists = prev.some((p) => matches(p._id, product._id) || matches(p.id, product.id));
      if (exists) {
        // Remove only the exact matching product
        return prev.filter((p) => !(matches(p._id, product._id) || matches(p.id, product.id)));
      }
      // Add new product to wishlist
      return [...prev, product];
    });
  };

  const value = { wishlist, isWishlisted, toggleWishlist };
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);
