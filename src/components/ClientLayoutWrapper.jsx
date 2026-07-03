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
          <div style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5' }}>
            {toast.type === 'order_placed' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
            {toast.type === 'order_shipped' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
            {toast.type === 'order_delivered' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            {toast.type === 'order_cancelled' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            {toast.type === 'order_updated' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
            {toast.type === 'support_ticket_reply' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
            {(!toast.type || (!toast.type.startsWith('order_') && toast.type !== 'support_ticket_reply')) && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
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
