'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { NotificationsProvider, useNotifications } from '@/context/NotificationsContext';

function AdminLayoutContent({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef(null);

  const getPageTitle = (path) => {
    if (path === '/admin' || path === '/admin/') return 'Dashboard';
    const parts = path.split('/').filter(Boolean);
    if (parts.includes('edit')) return `Edit ${parts[1].slice(0, -1)}`;
    if (parts.includes('new')) return `Add ${parts[1].slice(0, -1)}`;
    return parts[1] || 'Dashboard';
  };

  const { notifications, unreadCount, totalCount, markAsRead, markAllAsRead } = useNotifications();
  const [toast, setToast] = useState(null);
  const prevCountRef = useRef(notifications.length);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show a toast popup whenever a new notification arrives (cross-tab sync)
  useEffect(() => {
    if (notifications.length > prevCountRef.current) {
      const newest = notifications[0]; // newest is always first
      if (newest?.unread) {
        setToast(newest);
        const timer = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(timer);
      }
    }
    prevCountRef.current = notifications.length;
  }, [notifications]);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--accent)] font-semibold animate-pulse">Loading Admin...</p>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/stock', label: 'Stock Management' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/tickets', label: 'Support Tickets' },
    { href: '/admin/cms', label: 'CMS' },
    { href: '/admin/notifications', label: 'Notifications' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <>
    <div className="min-h-screen bg-[var(--background)] flex relative overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111] text-white flex flex-col shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-[#222]">
          <Link href="/admin">
            <h2 className="text-xl font-bold tracking-widest text-[#c8a96e] uppercase text-center cursor-pointer">
              Admin Panel
            </h2>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin');
            return (
              <Link key={link.href} href={link.href}>
                <span
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-gray-400 hover:bg-[#222] hover:text-white'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#222]">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-[#222] hover:text-red-300 transition-colors"
          >
            Logout
          </button>
          <div className="mt-4 text-center">
            <Link href="/">
              <span className="text-xs text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors cursor-pointer">
                Back to Store
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-[var(--border)] px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
          {/* Left Side: Title & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-[var(--foreground)]"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h1 className="text-xl font-semibold text-[var(--foreground)] capitalize hidden sm:block">
              {getPageTitle(pathname)}
            </h1>
          </div>

          {/* Right Side / Center: Top Bar Items */}
          <div className="flex flex-1 justify-end items-center gap-3 sm:gap-6">
            
            {/* Search */}
            <div className="relative max-w-[140px] sm:max-w-sm w-full">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[#FAF8F5] border border-[var(--border)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
              <svg className="w-4 h-4 absolute right-4 top-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[var(--border)] z-50 overflow-hidden -mr-16 sm:mr-0">
                  <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                    <h3 className="font-bold text-[var(--foreground)]">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-[var(--accent)] cursor-pointer hover:underline">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 3).map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          markAsRead(notif.id);
                          setNotifOpen(false);
                          if (notif.type === 'order') router.push('/admin/orders');
                          if (notif.type === 'user') router.push('/admin/users');
                        }}
                        className={`p-4 border-b border-[var(--border)] hover:bg-[#FAF8F5] transition-colors cursor-pointer ${notif.unread ? 'bg-[#FAF8F5]/50 border-l-4 border-l-[var(--accent)]' : 'border-l-4 border-l-transparent'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm ${notif.unread ? 'font-bold text-[var(--foreground)]' : 'font-medium text-[var(--text-muted)]'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{notif.desc}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-4 text-center text-sm text-[var(--text-muted)]">No notifications</div>
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-[var(--border)] bg-gray-50">
                    <Link href="/admin/notifications" onClick={() => setNotifOpen(false)} className="text-sm font-medium text-[var(--accent)] hover:underline block w-full">
                      View all notifications ({totalCount})
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 border-l border-[var(--border)] pl-3 sm:pl-6">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden lg:block text-sm">
                <p className="font-semibold text-[var(--foreground)] leading-tight">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">Admin</p>
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>

      {/* New Order Toast Popup */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 9999,
            width: '340px',
            background: '#1a1a1a',
            color: 'white',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
            animation: 'slideInToast 0.35s ease',
          }}
        >
          <div style={{
            width: '36px', height: '36px', minWidth: '36px',
            background: toast.type === 'user' ? '#16a34a' : 'var(--accent)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {toast.type === 'user' ? (
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{toast.title}</p>
            <p style={{ fontSize: '0.78rem', color: '#ccc', lineHeight: 1.4 }}>{toast.desc}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '18px', lineHeight: 1, marginTop: '-2px' }}
          >&times;</button>
        </div>
      )}
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default function AdminLayout({ children }) {
  return (
    <NotificationsProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </NotificationsProvider>
  );
}
