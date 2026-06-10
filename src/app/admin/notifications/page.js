'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationsContext';

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, deleteNotifications } = useNotifications();
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, idsToDelete: [] });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length && notifications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleMarkSelectedAsRead = () => {
    markAsRead(selectedIds);
    setSelectedIds([]);
  };

  const confirmDelete = (ids) => {
    setDeleteModal({ isOpen: true, idsToDelete: Array.isArray(ids) ? ids : [ids] });
  };

  const handleDeleteConfirmed = () => {
    deleteNotifications(deleteModal.idsToDelete);
    setSelectedIds([]);
    setDeleteModal({ isOpen: false, idsToDelete: [] });
  };

  const getIcon = (type) => {
    switch(type) {
      case 'order': return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
      case 'alert': return <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      case 'user': return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
      default: return <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Notifications Center</h2>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-medium text-[var(--accent)] hover:underline bg-white px-4 py-2 rounded-lg border border-[var(--border)] shadow-sm"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        {/* Bulk Actions Header */}
        {notifications.length > 0 && (
          <div className="p-4 border-b border-[var(--border)] bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                checked={selectedIds.length === notifications.length && notifications.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-[var(--accent)] border-gray-300 rounded focus:ring-[var(--accent)] cursor-pointer"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select All'}
              </span>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleMarkSelectedAsRead}
                  className="text-xs font-semibold text-[var(--foreground)] bg-white px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Mark as Read
                </button>
                <button 
                  onClick={() => confirmDelete(selectedIds)}
                  className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <p className="text-lg font-medium text-[var(--foreground)]">You're all caught up!</p>
            <p className="text-sm mt-1">There are no new notifications to review.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={(e) => {
                  if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                    if (notif.type === 'order') router.push('/admin/orders');
                    if (notif.type === 'user') router.push('/admin/users');
                  }
                }}
                className={`p-6 flex gap-4 transition-colors cursor-pointer ${notif.unread ? 'bg-[#FAF8F5]' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-start mt-1">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(notif.id)}
                    onChange={() => toggleSelect(notif.id)}
                    className="w-4 h-4 text-[var(--accent)] border-gray-300 rounded focus:ring-[var(--accent)] cursor-pointer mt-2"
                  />
                </div>
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.unread ? 'bg-white shadow-sm border border-[var(--border)]' : 'bg-gray-100'}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-base ${notif.unread ? 'font-bold text-[var(--foreground)]' : 'font-medium text-[var(--text-muted)]'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{notif.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{notif.desc}</p>
                  
                  <div className="mt-3 flex gap-4 items-center">
                    {notif.unread && (
                      <button onClick={() => markAsRead(notif.id)} className="text-xs font-semibold text-[var(--accent)] hover:underline">
                        Mark as read
                      </button>
                    )}
                    <button onClick={() => confirmDelete(notif.id)} className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                
                {notif.unread && (
                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-center text-[var(--foreground)] mb-2">
              Delete {deleteModal.idsToDelete.length} Notification{deleteModal.idsToDelete.length !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-center text-[var(--text-muted)] mb-6">
              This action cannot be undone. Are you sure you want to permanently delete these notifications?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, idsToDelete: [] })}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirmed}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
