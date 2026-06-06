'use client';

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("downtown_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("downtown_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size = "M", quantity = 1) => {
    setCart((prev) => {
      const key = `${product._id || product.id}-${size}`;
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { key, product, size, quantity }];
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
