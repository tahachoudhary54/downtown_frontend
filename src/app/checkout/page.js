'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart } = useCart();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pinCode: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // If cart is empty and not on success screen, redirect back
  if (cart.length === 0 && !isSuccess) {
    router.push('/cart');
    return null;
  }

  const shippingCost = totalPrice >= 999 ? 0 : 99;
  const finalTotal = totalPrice + shippingCost;

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderPayload = {
      ...(user?.id && { user: user.id }),
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      },
      shippingAddress: {
        address: formData.address,
        city: formData.city,
        pinCode: formData.pinCode,
      },
      items: cart.map(item => ({
        product: item.product._id || item.product.id,
        name: item.product.name,
        size: item.size,
        quantity: item.quantity,
        price: parseFloat((item.product.price || "0").toString().replace(/[^0-9.]/g, "")) || 0,
      })),
      financials: {
        subtotal: totalPrice,
        shippingCost: shippingCost,
        total: finalTotal,
      },
      paymentMethod: paymentMethod
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      
      if (data.success) {
        const orderId = data.data?._id?.slice(-6).toUpperCase() || '------';
        addNotification({
          title: 'New Order Received',
          desc: `Order #${orderId} placed by ${formData.firstName} ${formData.lastName} for ₹${finalTotal.toLocaleString('en-IN')}. Please review and prepare for shipping.`,
          type: 'order',
        });
        setIsSuccess(true);
        clearCart();
      } else {
        alert("Failed to place order: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.successPage}>
          <div className={styles.successIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className={styles.successTitle}>Order Placed!</h1>
          <p className={styles.successText}>
            Thank you for your purchase. We've received your order and are getting it ready to be shipped. 
            You will receive a confirmation email shortly.
          </p>
          <Link href="/shop" className={styles.btnHome}>
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>
      
      <div className={styles.container}>
        {/* Left Column: Form & Payment */}
        <div className={styles.mainPanel}>
          <form id="checkout-form" onSubmit={handlePay}>
            
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact & Shipping</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
                </div>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                </div>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 9876543210" />
                </div>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="123 Main St, Apartment 4B" />
                </div>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Mumbai" />
                </div>
                <div className={styles.inputGroup}>
                  <label>PIN Code</label>
                  <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} required placeholder="400001" />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment Method</h2>
              <div className={styles.paymentMethods}>
                
                <label className={`${styles.paymentOption} ${paymentMethod === 'upi' ? styles.selected : ''}`}>
                  <div className={styles.paymentIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  </div>
                  <div className={styles.paymentDetails}>
                    <h4>UPI (Google Pay, PhonePe, Paytm)</h4>
                    <p>Pay instantly via your UPI app</p>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'upi'} 
                    onChange={() => setPaymentMethod('upi')}
                  />
                </label>

                <label className={`${styles.paymentOption} ${paymentMethod === 'netbanking' ? styles.selected : ''}`}>
                  <div className={styles.paymentIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div className={styles.paymentDetails}>
                    <h4>Net Banking</h4>
                    <p>All major Indian banks supported</p>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'netbanking'} 
                    onChange={() => setPaymentMethod('netbanking')}
                  />
                </label>

              </div>
            </div>

          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryPanel}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            
            <div className={styles.summaryItems}>
              {cart.map((item, index) => (
                <div key={index} className={styles.summaryItem}>
                  <div className={styles.itemImage}>
                    <div className={styles.itemBadge}>{item.quantity}</div>
                    <Image src={item.product.img || '/placeholder.png'} alt={item.product.name} fill />
                  </div>
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{item.product.name}</h4>
                    <p className={styles.itemMeta}>Size: {item.size}</p>
                  </div>
                  <div className={styles.itemPrice}>
                    ₹{((parseFloat((item.product.price || "0").toString().replace(/[^0-9.]/g, "")) || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              className={styles.btnPay}
              disabled={isProcessing}
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Pay ₹{finalTotal.toLocaleString('en-IN')} securely
                </>
              )}
            </button>
            <Link href="/cart" className={styles.btnBack}>
              Return to Cart
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
