'use client';

import { useCart } from "../../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import styles from "./cart.module.css";

import { useLiveStock, useAllLiveStocks } from "../../context/RealtimeStockContext";
import { getSalePricing } from "../../utils/price";

function CartItem({ item, updateQuantity, removeFromCart }) {
  const liveStock = useLiveStock(item.product._id || item.product.id, item.product.stock !== undefined ? item.product.stock : (item.product.totalStock || 0));
  const { isSaleValid, originalPriceStr, salePriceStr } = getSalePricing(item.product);

  const variant = item.product.variants?.find(v => v.colorName === item.color);
  const itemImage = variant && variant.images && variant.images.length > 0 ? variant.images[0] : item.product.img;

  return (
    <div className={styles.cartItem} style={{ opacity: liveStock === 0 ? 0.6 : 1 }}>
      <div className={styles.itemImage}>
        <Image
          src={itemImage}
          alt={item.product.name}
          fill
          style={{ objectFit: "cover", filter: liveStock === 0 ? 'grayscale(20%)' : 'none' }}
        />
        {liveStock === 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(17,17,17,0.85)', color: '#fff', padding: '6px 14px', fontSize: '11px',
            borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: '500', letterSpacing: '0.15em', backdropFilter: 'blur(4px)'
          }}>OUT OF STOCK</div>
        )}
      </div>

      <div className={styles.itemDetails}>
        <p className={styles.itemBrand}>DOWNTOWN EXCLUSIVE</p>
        <h3 className={styles.itemName}>{item.product.name}</h3>
        <p className={styles.itemSize}>Size: <strong>{item.size}</strong></p>
        {item.color && <p className={styles.itemSize}>Color: <strong>{item.color}</strong></p>}
        {isSaleValid ? (
          <div className="premiumPriceContainer">
            <span className="premiumOriginalPrice">{originalPriceStr}</span>
            <span className="premiumSalePrice">{salePriceStr}</span>
          </div>
        ) : (
          <p className={styles.itemPrice}>{item.product.price}</p>
        )}
        {liveStock === 0 && <p style={{ color: '#991b1b', fontSize: '0.8rem', fontWeight: 600, marginTop: '5px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Currently Out of Stock</p>}
      </div>

      <div className={styles.itemActions}>
        <div className={styles.quantityControl}>
          <button
            className={styles.qtyBtn}
            onClick={() => updateQuantity(item.key, item.quantity - 1)}
            disabled={liveStock === 0}
          >−</button>
          <span className={styles.qtyValue}>{item.quantity}</span>
          <button
            className={styles.qtyBtn}
            onClick={() => updateQuantity(item.key, item.quantity + 1)}
            disabled={liveStock === 0}
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
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const allLiveStocks = useAllLiveStocks();

  const hasOutOfStockItems = cart.some(item => {
    const pId = item.product._id || item.product.id;
    const stock = allLiveStocks[pId] !== undefined ? allLiveStocks[pId] : (item.product.stock !== undefined ? item.product.stock : (item.product.totalStock || 0));
    return stock === 0;
  });

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
              <CartItem key={item.key} item={item} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
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
              <span>Calculated later</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>

            <p className={styles.shippingNote} style={{ color: '#666', background: '#f5f5f5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4', textAlign: 'center' }}>
              Delivery charges are not included in the order total. Delivery will be arranged after order confirmation and charges will be paid by the customer. You will be notified on the website for delivery charges.
            </p>

            {hasOutOfStockItems ? (
              <button className={styles.btnCheckout} style={{ display: 'block', width: '100%', textAlign: 'center', opacity: 0.5, cursor: 'not-allowed' }} disabled>REMOVE OUT OF STOCK ITEMS TO PROCEED</button>
            ) : (
              <Link href="/checkout" className={styles.btnCheckout} style={{ display: 'block', textAlign: 'center' }}>PROCEED TO CHECKOUT</Link>
            )}
            <Link href="/shop" className={styles.btnContinue}>CONTINUE SHOPPING</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
