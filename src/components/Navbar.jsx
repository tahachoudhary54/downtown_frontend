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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

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
          <span>FREE SHIPPING</span> ON ORDERS ABOVE ₹999 | CASH ON DELIVERY AVAILABLE
        </div>
      </div>
      
      {/* Header */}
      <header className={`${styles.header} ${headerClass}`}>
        <div className={styles.container}>
          {/* Logo in Left */}
          <div className={styles.logo}>
            <a href="/">
              <Image src="/logo-horizontal-v2.png" alt="MEN'S" width={145} height={36} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} priority />
            </a>
          </div>
          
          {/* Navigation on Center */}
          <nav className={`${styles.nav} ${navOpen ? styles.navOpen : ''}`}>
            <a href="/" className={pathname === '/' ? styles.active : ''} onClick={() => setNavOpen(false)}>Home</a>
            <a href="/shop" className={pathname === '/shop' ? styles.active : ''} onClick={() => setNavOpen(false)}>Shop</a>
            <a href="/clothing" className={pathname.startsWith('/clothing') ? styles.active : ''} onClick={() => setNavOpen(false)}>Clothing</a>
            <a href="/sale" className={pathname === '/sale' ? styles.active : ''} onClick={() => setNavOpen(false)}>Sale</a>
            <a href="/wishlist" className={`${pathname === '/wishlist' ? styles.active : ''} ${styles.mobileOnlyLink}`} onClick={() => setNavOpen(false)}>Wishlist</a>
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
                  className={styles.iconButton} 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User Menu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userInfo}>
                      <span className={styles.userDropdownName}>{user.name || 'User'}</span>
                      <span className={styles.userDropdownEmail} title={user.email}>{user.email}</span>
                    </div>

                    <Link href="/account" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      My Account
                    </Link>

                    <Link href="/orders" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      My Orders
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
                  {unreadCount > 0 && (
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
                              if (notif.orderId) { /* Do nothing since profile is removed */ }
                            }}
                          >
                            <span className={styles.notifIcon}>
                              {notif.type === 'order_placed' && '🛍️'}
                              {notif.type === 'order_shipped' && '🚚'}
                              {notif.type === 'order_delivered' && '✅'}
                              {notif.type === 'order_cancelled' && '❌'}
                              {notif.type === 'order_updated' && '📦'}
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
              {wishlist.length > 0 ? <IconHeartFilled /> : <IconHeartOutline />}
              {wishlist.length > 0 && (
                <span className={styles.cartBadge} style={{ top: '-6px', right: '-6px', position: 'absolute' }}>{wishlist.length}</span>
              )}
            </button>
            <Link href="/cart" aria-label="Cart" className={styles.cartIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              {totalItems > 0 && (
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
