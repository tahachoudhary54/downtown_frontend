'use client';

import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import styles from "./product.module.css";

export default function AddToCartSection({ product }) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, selectedSize, 1);
    setAdded(true);
  };

  return (
    <>
      <div className={styles.sizes}>
        <h4>SELECT SIZE</h4>
        <div className={styles.sizeOptions}>
          {["S", "M", "L", "XL"].map((size) => (
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

      <button
        className={`${styles.btnAddToCart} ${added ? styles.btnAdded : ""}`}
        onClick={handleAddToCart}
      >
        {added ? "✓ ADDED TO CART" : "ADD TO CART"}
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
