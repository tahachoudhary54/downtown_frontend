'use client';

import { createContext, useContext, useEffect } from 'react';
import useSWR from 'swr';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const CustomerNotificationsContext = createContext();

export function CustomerNotificationsProvider({ children }) {
  const { token, user } = useAuth();
  
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const fetcher = (url) => fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const { data: notificationsData, mutate } = useSWR(
    user && token ? `${apiBase}/api/notifications` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: countData, mutate: mutateCount } = useSWR(
    user && token ? `${apiBase}/api/notifications/unread-count` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  // Socket listener for real-time notifications
  useEffect(() => {
    if (!user || !user._id) return;
    
    const socket = io(apiBase);
    
    socket.on('connect', () => {
      console.log('Customer socket connected');
    });

    socket.on(`user_notification_${user._id}`, (data) => {
      // Optimistically update notifications by triggering SWR refetch
      mutate();
      mutateCount();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, apiBase, mutate, mutateCount]);

  const notifications = notificationsData?.data || [];
  const unreadCount = countData?.count || 0;

  const markAsRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      mutate();
      mutateCount();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch(`${apiBase}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      mutate();
      mutateCount();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!token) return;
    try {
      await fetch(`${apiBase}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      mutate();
      mutateCount();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <CustomerNotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }}>
      {children}
    </CustomerNotificationsContext.Provider>
  );
}

export function useCustomerNotifications() {
  return useContext(CustomerNotificationsContext);
}
