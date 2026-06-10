'use client';

import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import styles from "./product.module.css";

import { useLiveStock } from "../../../context/RealtimeStockContext";

export default function AddToCartSection({ product }) {
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL"];
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || "");
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const liveStock = useLiveStock(product._id || product.id, product.stock !== undefined ? product.stock : (product.totalStock || 0));

  let stockStatus = { text: '', className: '' };
  if (liveStock === 0) {
    stockStatus = { text: 'Out of Stock', className: styles.stockOut };
  } else if (liveStock >= 20) {
    stockStatus = { text: 'In Stock', className: styles.stockInStock };
  } else if (liveStock >= 6) {
    stockStatus = { text: `Availability: Only ${liveStock} left in stock`, className: styles.stockLow };
  } else {
    stockStatus = { text: `🔥 Availability: Hurry! Only ${liveStock} left`, className: styles.stockCritical };
  }

  const handleAddToCart = () => {
    if (liveStock === 0) return;
    addToCart(product, selectedSize, 1);
    setAdded(true);
  };

  return (
    <>
      <p className={`${styles.stockIndicator} ${stockStatus.className}`}>
        {stockStatus.text}
      </p>

      {availableSizes.length > 0 && liveStock > 0 && (
        <div className={styles.sizes}>
          <h4>SELECT SIZE</h4>
          <div className={styles.sizeOptions}>
            {availableSizes.map((size) => (
              <button
                key={size}
                className={selectedSize === size ? styles.active : ""}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className={`${styles.btnAddToCart} ${added ? styles.btnAdded : ""} ${liveStock === 0 ? styles.btnAddToCartDisabled : ""}`}
        onClick={handleAddToCart}
        disabled={liveStock === 0}
      >
        {liveStock === 0 ? "OUT OF STOCK" : added ? "✓ ADDED TO CART" : "ADD TO CART"}
      </button>

      {added && (
        <Link
          href="/cart"
          className={styles.btnViewCart}
          style={{ textAlign: 'center', textDecoration: 'none' }}
        >
          VIEW CART →
        </Link>
      )}
    </>
  );
}
