'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();
  const [cartKey, setCartKey] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);

  // Initialize cart key based on user or guest
  useEffect(() => {
    if (user && user.id) {
      setCartKey(`downtown_cart_${user.id}`);
    } else {
      let guestId = localStorage.getItem("downtown_guest_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2, 11) + Date.now();
        localStorage.setItem("downtown_guest_id", guestId);
      }
      setCartKey(`downtown_cart_${guestId}`);
    }
  }, [user]);

  // Load cart when cartKey changes
  useEffect(() => {
    if (!cartKey) return;
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart([]); // Clear cart if new key has no saved data
      }
    } catch {
      setCart([]);
    }
    setLoadedKey(cartKey);
  }, [cartKey]);

  // Save cart to localStorage whenever it changes, BUT only if it belongs to current key
  useEffect(() => {
    if (!cartKey || loadedKey !== cartKey) return;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey, loadedKey]);

  const addToCart = (product, size = "M", color = "", quantity = 1) => {
    setCart((prev) => {
      const key = color ? `${product._id || product.id}-${size}-${color}` : `${product._id || product.id}-${size}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { key, product, size, color, quantity }];
    });
  };

  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const numericString = (item.product.price || "0").toString().replace(/[^0-9.]/g, "");
    const price = parseFloat(numericString);
    return sum + (isNaN(price) ? 0 : price) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
