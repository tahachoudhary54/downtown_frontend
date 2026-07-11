'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCustomerNotifications } from "../context/CustomerNotificationsContext";
import IconHeartOutline from "./IconHeartOutline";
import IconHeartFilled from "./IconHeartFilled";
import styles from "./Navbar.module.css";
import { motion } from "framer-motion";
import { useLoading } from "../context/LoadingContext";
import { useAIStylist } from "../context/AIStylistContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useCustomerNotifications();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const { openStylist, preloadStylist } = useAIStylist();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    } else {
      setSearchOpen(false);
    }
  };

  // Fetch live suggestions from API
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data.data?.slice(0, 5) || []);
      } catch {
        setSuggestions([]);
      }
    }, 300); // debounce 300ms
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSuggestionClick = (product) => {
    router.push(`/product/${product._id || product.id}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY > 40) {
        setSearchOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when notifications or mobile nav are open
  useEffect(() => {
    if (notifOpen || navOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      // Store the scroll position on the body for retrieval
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      const scrollY = document.body.getAttribute('data-scroll-y');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0'));
        document.body.removeAttribute('data-scroll-y');
      }
    }
  }, [notifOpen, navOpen]);

  const { isAppReady, isFirstVisit } = useLoading() || { isAppReady: true, isFirstVisit: false };

  let headerClass;
  if (isHome) {
    headerClass = scrolled ? styles.headerFixedTransparent : styles.headerHome;
  } else {
    headerClass = styles.headerSolid;
  }

  return (
    <>
      {/* Top Notification Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarCenter}>
          <span>PORT</span> — Designed for those who move with purpose.
        </div>
      </div>
      
      {/* Header */}
      <header className={`${styles.header} ${headerClass}`}>
        <div className={styles.container}>
          {/* Logo in Left */}
          <div className={styles.logo}>
            <Link href="/">
              <Image src="/logo-horizontal-v2.png" alt="MEN'S" width={140} height={34} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} priority />
            </Link>
          </div>
          
          {/* Navigation on Center */}
          <nav className={`${styles.nav} ${navOpen ? styles.navOpen : ''}`}>
            <Link href="/" className={pathname === '/' ? styles.active : ''} onClick={() => setNavOpen(false)}>Home</Link>
            <Link href="/shop" className={pathname === '/shop' ? styles.active : ''} onClick={() => setNavOpen(false)}>Shop</Link>
            <Link href="/clothing" className={pathname.startsWith('/clothing') ? styles.active : ''} onClick={() => setNavOpen(false)}>Clothing</Link>
            <Link href="/sale" className={pathname === '/sale' ? styles.active : ''} onClick={() => setNavOpen(false)}>Sale</Link>
            <button 
              className={styles.aiStylistLink} 
              onMouseEnter={() => preloadStylist?.()}
              onClick={() => { setNavOpen(false); openStylist(); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginRight:'5px',verticalAlign:'middle'}}><path d="M15 4l5 5L8 21l-5-1 1-5z"/><path d="M15 4l5 5"/></svg>AI Stylist
            </button>
            <Link href="/wishlist" className={`${pathname === '/wishlist' ? styles.active : ''} ${styles.mobileOnlyLink}`} onClick={() => setNavOpen(false)}>Wishlist</Link>
          </nav>
          
          {/* Icons in Right */}
          <div className={styles.userIcons}>
            <div className={styles.searchWrapper} ref={searchRef}>
              <form className={styles.searchContainer} onSubmit={handleSearch}>
                {searchOpen && (
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className={styles.searchInput} 
                    autoFocus 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                )}
                <button 
                  type="button" 
                  className={styles.iconButton} 
                  onClick={(e) => {
                    if (searchOpen && searchQuery.trim()) {
                      handleSearch(e);
                    } else {
                      setSearchOpen(!searchOpen);
                      setSearchQuery("");
                    }
                  }} 
                  aria-label="Toggle Search"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {searchOpen && suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {suggestions.map((product, index) => (
                    <button
                      key={product.id || product._id || `suggestion-${index}`}
                      className={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(product)}
                    >
                      <div className={styles.suggestionThumb}>
                        <Image src={product.img} alt={product.name} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                      </div>
                      <div className={styles.suggestionInfo}>
                        <span className={styles.suggestionName}>{product.name}</span>
                        <span className={styles.suggestionPrice}>{product.price}</span>
                      </div>
                    </button>
                  ))}
                  <button className={styles.suggestionViewAll} onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}>
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className={styles.userMenuWrapper} ref={userMenuRef}>
                <button 
                  type="button"
                  className={`${styles.iconButton} ${user.name ? styles.avatarButton : ''}`} 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User Menu"
                >
                  {user.name ? (
                    <div className={styles.userAvatar}>
                      {getInitials(user.name)}
                    </div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </button>
                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userInfo}>
                      <span className={styles.userDropdownName}>{user.name || 'User'}</span>
                      <span className={styles.userDropdownEmail} title={user.email}>{user.email}</span>
                    </div>

                    <Link href="/account?tab=profile" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      My Profile
                    </Link>

                    <Link href="/orders" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      My Orders
                    </Link>

                    <Link href="/profile/returns" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                        <polyline points="21 8 21 21 3 21 3 8"></polyline>
                        <rect x="1" y="3" width="22" height="5"></rect>
                        <line x1="10" y1="12" x2="14" y2="12"></line>
                      </svg>
                      Returns & Exchanges
                    </Link>

                    <Link href="/wishlist" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      Wishlist
                    </Link>

                    <Link href="/account?tab=addresses" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      Saved Addresses
                    </Link>

                    {user.role === 'admin' && (
                      <Link href="/admin" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        Admin Panel
                      </Link>
                    )}
                    <button 
                      className={styles.userDropdownItem} 
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" aria-label="User Account" onClick={() => sessionStorage.removeItem('redirectAfterAuth')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            )}
            {/* Notification Bell — only for logged-in non-admin users */}
            {user && (
              <div className={styles.notifWrapper} ref={notifRef}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                  style={{ position: 'relative' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {(mounted && unreadCount > 0) && (
                    <span className={styles.cartBadge} style={{ top: '-6px', right: '-6px', position: 'absolute' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>
                      <span className={styles.notifTitle}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          className={styles.notifMarkAll}
                          onClick={() => markAllAsRead()}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className={styles.notifList}>
                      {notifications.length === 0 ? (
                        <div className={styles.notifEmpty}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '0.5rem' }}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                          </svg>
                          <p>No notifications yet.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            className={`${styles.notifItem} ${!notif.isRead ? styles.notifItemUnread : ''}`}
                            onClick={() => {
                              markAsRead(notif._id);
                              setNotifOpen(false);
                              if (notif.orderId || notif.type?.startsWith('order_')) {
                                router.push('/orders');
                              } else if (notif.type === 'support_ticket_reply') {
                                router.push(`/account?tab=support&ticketId=${notif.ticketId || ''}`);
                              }
                            }}
                          >
                            <span className={styles.notifIcon}>
                              {notif.type === 'order_placed' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
                              {notif.type === 'order_shipped' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
                              {notif.type === 'order_delivered' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                              {notif.type === 'order_cancelled' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                              {notif.type === 'order_updated' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                            </span>
                            <div className={styles.notifContent}>
                              <p className={styles.notifItemTitle}>{notif.title}</p>
                              <p className={styles.notifItemMsg}>{notif.message}</p>
                              <p className={styles.notifTime}>
                                {new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.isRead && <span className={styles.notifDot} />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist button */}
            <button
              className={`${styles.iconButton} ${styles.hideOnMobile}`}
              onClick={() => router.push('/wishlist')}
              aria-label="Wishlist"
              style={{ position: 'relative' }}
            >
              {(mounted && wishlist.length > 0) ? <IconHeartFilled /> : <IconHeartOutline />}
              {(mounted && wishlist.length > 0) && (
                <span className={styles.cartBadge} style={{ top: '-6px', right: '-6px', position: 'absolute' }}>{wishlist.length}</span>
              )}
            </button>
            <Link href="/cart" aria-label="Cart" className={styles.cartIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              {(mounted && totalItems > 0) && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </Link>
          </div>
          
          {/* Hamburger Menu for Mobile */}
          <button 
            className={styles.hamburgerBtn}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle navigation"
          >
            {navOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
