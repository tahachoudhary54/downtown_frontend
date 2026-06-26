'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCustomerNotifications } from '../context/CustomerNotificationsContext';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from './LoadingScreen';
import { useLoading } from '../context/LoadingContext';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith('/admin');
  
  const { notifications, markAsRead } = useCustomerNotifications();
  const [toast, setToast] = useState(null);
  const [prevNotifCount, setPrevNotifCount] = useState(0);

  useEffect(() => {
    if (isAdmin || !notifications) return;
    
    if (notifications.length > prevNotifCount && prevNotifCount !== 0) {
      // New notification arrived
      const newest = notifications[0];
      if (!newest.isRead) {
        setToast(newest);
        const timer = setTimeout(() => setToast(null), 6000);
        setPrevNotifCount(notifications.length);
        return () => clearTimeout(timer);
      } else {
        setPrevNotifCount(notifications.length);
      }
    } else if (notifications.length !== prevNotifCount) {
      setPrevNotifCount(notifications.length);
    }
  }, [notifications, prevNotifCount, isAdmin]);

  const { isAppReady } = useLoading();

  return (
    <>
      <LoadingScreen isAppReady={isAppReady} />
      <div style={{ backgroundColor: 'var(--background)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isAdmin && <Navbar />}
        <main style={{ flex: 1 }}>{children}</main>
        {!isAdmin && <Footer />}
      </div>

      {/* Customer Notification Toast Popup */}
      {toast && !isAdmin && (
        <div 
          style={{
            position: 'fixed',
            top: '100px',
            right: '24px',
            background: '#ffffff',
            color: '#111',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            maxWidth: '350px',
            cursor: 'pointer',
            animation: 'slideInToast 0.35s cubic-bezier(0.21, 1.02, 0.73, 1)'
          }}
          onClick={() => {
            markAsRead(toast._id);
            setToast(null);
            if (toast.orderId || toast.type?.startsWith('order_')) {
              router.push('/orders');
            } else if (toast.type === 'support_ticket_reply') {
              router.push('/account?tab=support');
            }
          }}
        >
          <div style={{ fontSize: '24px', lineHeight: 1 }}>
            {toast.type === 'order_placed' && '🛍️'}
            {toast.type === 'order_shipped' && '🚚'}
            {toast.type === 'order_delivered' && '✅'}
            {toast.type === 'order_cancelled' && '❌'}
            {toast.type === 'order_updated' && '📦'}
            {toast.type === 'support_ticket_reply' && '💬'}
            {(!toast.type || (!toast.type.startsWith('order_') && toast.type !== 'support_ticket_reply')) && '🔔'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px', color: '#111' }}>{toast.title}</p>
            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.4 }}>{toast.message}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }}
            style={{
              background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: '0 0 0 8px', fontSize: '1.2rem', lineHeight: 1
            }}
          >
            ×
          </button>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideInToast {
              from { transform: translateX(100%) scale(0.9); opacity: 0; }
              to { transform: translateX(0) scale(1); opacity: 1; }
            }
          `}} />
        </div>
      )}
    </>
  );
}
