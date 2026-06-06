'use client';

import { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Order Received', desc: 'Order #ORD-0921 has been placed successfully. Please review and prepare for shipping.', time: '5 minutes ago', unread: true, type: 'order' },
    { id: 2, title: 'Low Stock Alert', desc: 'Product "Classic Wool Coat" is running low on stock (2 left). Consider restocking soon to avoid missed sales.', time: '1 hour ago', unread: true, type: 'alert' },
    { id: 3, title: 'New User Registration', desc: 'Sarah Smith (sarah.smith@example.com) just created a new customer account.', time: '3 hours ago', unread: false, type: 'user' },
    { id: 4, title: 'Order Delivered', desc: 'Order #ORD-0890 has been successfully delivered to the customer.', time: '1 day ago', unread: false, type: 'order' },
    { id: 5, title: 'System Update', desc: 'The Downtown Boutique backend system was updated to v1.2.4 successfully.', time: '2 days ago', unread: false, type: 'system' },
  ]);

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
      markAsRead,
      markAllAsRead,
      deleteNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
