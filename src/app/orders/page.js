'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import styles from './orders.module.css';

const TIMELINE_STEPS = [
  'Pending Delivery Quote',
  'Waiting for Customer Confirmation',
  'Confirmed',
  'Shipped',
  'Delivered'
];

export default function MyOrders() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetcher = (url) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

  const { data, mutate, isLoading } = useSWR(
    token ? `${apiBase}/api/orders/myorders` : null,
    fetcher
  );

  if (!mounted || loading || !user) return null;

  const orders = data?.data || [];

  const handleAction = async (orderId, action) => {
    setProcessingId(orderId);
    try {
      const res = await fetch(`${apiBase}/api/orders/${orderId}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!resData.success) {
        alert(resData.message || 'Action failed');
      }
      mutate();
    } catch (err) {
      console.error(err);
      alert('Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      const res = await fetch(`${apiBase}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!resData.success) {
        alert(resData.message || 'Failed to delete order');
      }
      mutate();
    } catch (err) {
      console.error(err);
      alert('Failed to delete order');
    }
  };

  const getStepStatus = (orderStatus, stepIndex) => {
    if (orderStatus === 'Cancelled') return 'cancelled';
    const currentIndex = TIMELINE_STEPS.indexOf(orderStatus);
    if (currentIndex === -1) return 'pending'; // fallback
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Orders</h1>
        
        {isLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</div>
                  <div className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={styles.orderStatusBadge} style={{
                    backgroundColor: order.orderStatus === 'Cancelled' ? '#fee2e2' : '#f3f4f6',
                    color: order.orderStatus === 'Cancelled' ? '#991b1b' : '#374151'
                  }}>
                    {order.orderStatus}
                  </div>
                  <button 
                    onClick={() => { if (window.confirm('Are you sure you want to permanently delete this order?')) handleDelete(order._id); }}
                    title="Delete Order"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>

              {order.orderStatus !== 'Cancelled' && (
                <div className={styles.timeline}>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const status = getStepStatus(order.orderStatus, idx);
                    return (
                      <div key={step} className={`${styles.timelineStep} ${status === 'active' ? styles.active : ''} ${status === 'completed' ? styles.completed : ''}`}>
                        {step.replace('Waiting for Customer Confirmation', 'Awaiting Confirm')}
                      </div>
                    );
                  })}
                </div>
              )}

              {order.orderStatus === 'Waiting for Customer Confirmation' && (
                <div className={styles.quoteSection}>
                  <p className={styles.quoteText}>
                    <strong>Delivery Quote Ready:</strong> Our team has calculated the delivery charge for your address to be <strong>₹{order.deliveryCharge}</strong>. 
                    Your new order total will be ₹{order.financials?.total?.toLocaleString('en-IN')}. Please confirm to proceed with dispatch.
                  </p>
                  <div className={styles.actions}>
                    <button 
                      onClick={() => handleAction(order._id, 'confirm-delivery')}
                      disabled={processingId === order._id}
                      className={styles.btnConfirm}
                    >
                      {processingId === order._id ? 'Processing...' : 'Confirm Delivery Charge'}
                    </button>
                    <button 
                      onClick={() => handleAction(order._id, 'cancel')}
                      disabled={processingId === order._id}
                      className={styles.btnCancel}
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.orderItems}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Items</h4>
                {order.items.map(item => (
                  <div key={item._id} className={styles.item}>
                    <span>{item.quantity}x {item.name} (Size: {item.size})</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
                  <div className={styles.item}>
                    <span>Subtotal</span>
                    <span>₹{order.financials.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  {order.deliveryCharge !== null && order.deliveryCharge !== undefined && (
                    <div className={styles.item}>
                      <span>Delivery Charge</span>
                      <span>₹{order.deliveryCharge?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className={styles.item} style={{ fontWeight: 700, color: '#000', marginTop: '4px' }}>
                    <span>Total</span>
                    <span>₹{order.financials.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
