'use client';

import { useCart } from "../../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import styles from "./cart.module.css";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyIcon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
        <p className={styles.emptyText}>Looks like you haven't added anything yet.</p>
        <Link href="/shop" className={styles.btnShop}>START SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>YOUR CART</h1>
          <p className={styles.subtitle}>{totalItems} {totalItems === 1 ? "item" : "items"}</p>
        </div>

        <div className={styles.content}>
          {/* Cart Items */}
          <div className={styles.itemsList}>
            {cart.map((item) => (
              <div key={item.key} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <Image
                    src={item.product.img}
                    alt={item.product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <p className={styles.itemBrand}>DOWNTOWN EXCLUSIVE</p>
                  <h3 className={styles.itemName}>{item.product.name}</h3>
                  <p className={styles.itemSize}>Size: <strong>{item.size}</strong></p>
                  <p className={styles.itemPrice}>{item.product.price}</p>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    >−</button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    >+</button>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.key)}
                    aria-label="Remove item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.free}>{totalPrice >= 999 ? "FREE" : "₹99"}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>₹{(totalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString("en-IN")}</span>
            </div>

            {totalPrice < 999 && (
              <p className={styles.shippingNote}>
                Add ₹{(999 - totalPrice).toLocaleString("en-IN")} more for <strong>FREE shipping</strong>
              </p>
            )}

            <Link href="/checkout" className={styles.btnCheckout} style={{ display: 'block', textAlign: 'center' }}>PROCEED TO CHECKOUT</Link>
            <Link href="/shop" className={styles.btnContinue}>CONTINUE SHOPPING</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
