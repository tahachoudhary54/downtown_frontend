'use client';

import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import styles from "./product.module.css";

import { useLiveStock } from "../../../context/RealtimeStockContext";

export default function AddToCartSection({ product }) {
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL"];
  const firstAvailableSize = availableSizes.find(size => !(product.inventory && product.inventory[size] === 0)) || availableSizes[0];
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize || "");
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const liveStock = useLiveStock(product._id || product.id, product.stock !== undefined ? product.stock : (product.totalStock || 0));

  let stockStatus = { text: '', className: '' };
  if (liveStock === 0) {
    stockStatus = { text: 'OUT OF STOCK', className: styles.stockOut };
  } else if (liveStock > 0 && liveStock <= 20) {
    stockStatus = { text: `ONLY ${liveStock} LEFT`, className: styles.stockLow };
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
                className={`${selectedSize === size ? styles.active : ""} ${product.inventory && product.inventory[size] === 0 ? styles.sizeDisabled : ""}`}
                onClick={() => setSelectedSize(size)}
                disabled={product.inventory && product.inventory[size] === 0}
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
