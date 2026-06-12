'use client';

import { createContext, useContext } from 'react';
import useSWR from 'swr';
import { useAuth } from './AuthContext';

const CustomerNotificationsContext = createContext();

export function CustomerNotificationsProvider({ children }) {
  const { token, user } = useAuth();
  
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const fetcher = (url) => fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  // Poll for notifications every 5 seconds if logged in
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
