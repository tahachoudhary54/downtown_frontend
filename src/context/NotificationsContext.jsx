'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationsContext = createContext();

const DEFAULT_NOTIFICATIONS = [];

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    // Load from localStorage on first render (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('downtown_notifications');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_NOTIFICATIONS;
  });

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem('downtown_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Sync across tabs: when the checkout tab adds a notification and saves to localStorage,
  // the admin tab receives the 'storage' event and picks it up in real time.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'downtown_notifications' && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for real-time WebSocket notifications from the server
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl);

    socket.on('admin_notification', (data) => {
      setNotifications((prev) => [{
        id: Date.now(),
        title: data.title,
        desc: data.desc,
        time: 'Just now',
        unread: true,
        type: data.type || 'alert'
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addNotification = ({ title, desc, type = 'order' }) => {
    const newNotif = {
      id: Date.now(),
      title,
      desc,
      time: 'Just now',
      unread: true,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setNotifications(prev => prev.map(n => idsArray.includes(n.id) ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotifications = (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setNotifications(prev => prev.filter(n => !idsArray.includes(n.id)));
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const totalCount = notifications.length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      totalCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
