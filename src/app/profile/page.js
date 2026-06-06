'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './profile.module.css';
import useSWR from 'swr';
import { useWishlist } from '../../context/WishlistContext';

// SVG Icons
const IconUser = () => <svg className={styles.avatarSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconPhone = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconPackage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const IconMapPin = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconGift = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconSupport = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

export default function ProfilePage() {
  const { user, loading, logout, updateProfile, token } = useAuth();
  const router = useRouter();
  const { wishlist, toggleWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrderForTicket, setSelectedOrderForTicket] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profileAvatar') || null;
    }
    return null;
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetcher = (url) => fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const { data: ordersData } = useSWR(
    user && token && (activeTab === 'orders' || activeTab === 'support') ? `${apiBase}/api/orders/myorders` : null,
    fetcher
  );
  
  const myOrders = ordersData?.data || [];

  const { data: ticketsData, mutate: mutateTickets } = useSWR(
    user && token && activeTab === 'support' ? `${apiBase}/api/tickets/my-tickets` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const myTickets = ticketsData?.data || [];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container} style={{ display: 'block', textAlign: 'center' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <div className={styles.ordersList}>
              {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <IconPackage />
                  <p style={{ marginTop: '1rem' }}>You haven't placed any orders yet.</p>
                  <button onClick={() => router.push('/shop')} style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Start Shopping</button>
                </div>
              ) : (
                myOrders.map(order => {
                  const orderIdDisplay = order._id.slice(-6).toUpperCase();
                  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', dateOptions);
                  
                  return (
                    <div key={order._id} className={styles.orderCard}>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderId}>Order #{orderIdDisplay}</span>
                        <span className={styles.orderDate}>Placed on {formattedDate}</span>
                      </div>
                      <div className={styles.orderStatusWrapper}>
                        <span className={`${styles.statusBadge} ${order.orderStatus === 'Delivered' ? styles.statusDelivered : styles.statusShipped}`}>
                          {order.orderStatus}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          <button onClick={() => router.push(`/profile/orders/${order._id}`)} className={styles.btnViewOrder}>View Details</button>
                          <button onClick={() => { setActiveTab('support'); setSelectedOrderForTicket(order._id); }} className={styles.btnSecondary} style={{ fontSize: '0.8rem', padding: '0.4rem' }}>Report Issue</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        );
        case 'wishlist': {
          return (
            <>
              <h2 className={styles.sectionTitle}>My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <IconHeart />
                  <p style={{ marginTop: '1rem' }}>Your wishlist is currently empty.</p>
                  <button style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Explore Collection</button>
                </div>
              ) : (
                <div className={styles.wishlistGrid}>
                  {wishlist.map((item) => (
                    <div key={item._id || item.id} className={styles.productCard}>
                      <div className={styles.productImageWrapper}>
                        <img src={item.img} alt={item.name} className={styles.productImage} />
                        <button className={styles.btnHeart} onClick={() => toggleWishlist(item)}>
                          <IconHeart />
                        </button>
                      </div>
                      <div className={styles.productInfo}>
                        <h4 className={styles.productName}>{item.name}</h4>
                        <p className={styles.productPrice}>{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        }
      case 'addresses':
        return (
          <>
            <h2 className={styles.sectionTitle}>Saved Addresses</h2>
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <IconMapPin />
              <p style={{ marginTop: '1rem' }}>No addresses saved yet.</p>
              <button style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Add New Address</button>
            </div>
          </>
        );
      case 'rewards':
        return (
          <>
            <h2 className={styles.sectionTitle}>Rewards & Points</h2>
            <div style={{ padding: '2rem', background: '#fafafa', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#c8a96e' }}>0</h3>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--foreground)' }}>Downtown Boutique Points</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Earn points on every purchase to unlock exclusive discounts.</p>
            </div>
          </>
        );
      case 'settings':
        return (
          <>
            <h2 className={styles.sectionTitle}>Account Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem' }}>Email Notifications</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input type="checkbox" defaultChecked /> Receive order updates
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" defaultChecked /> Receive promotional emails
                </label>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem', color: '#d32f2f' }}>Danger Zone</h4>
                <button style={{ padding: '0.6rem 1rem', border: '1px solid #d32f2f', color: '#d32f2f', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}>Delete Account</button>
              </div>
            </div>
          </>
        );
      case 'editProfile':
        return (
          <>
            <h2 className={styles.sectionTitle}>Edit Profile</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }} onSubmit={(e) => {
              e.preventDefault();
              updateProfile({ name, phone });
              setActiveTab('orders');
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>FULL NAME</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>PHONE NUMBER</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px' }} />
              </div>
              <button type="submit" style={{ padding: '0.8rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
            </form>
          </>
        );
      case 'support':
        return (
          <>
            <h2 className={styles.sectionTitle}>Customer Support</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Need help with an order? Create a support ticket.</p>
              <button onClick={() => router.push('/profile/tickets/new' + (selectedOrderForTicket ? `?order=${selectedOrderForTicket}` : ''))} style={{ padding: '0.6rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Create New Ticket</button>
            </div>

            <div className={styles.ordersList}>
              {myTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <IconSupport />
                  <p style={{ marginTop: '1rem' }}>You don't have any open support tickets.</p>
                </div>
              ) : (
                myTickets.map(ticket => {
                  const ticketIdDisplay = ticket._id.slice(-6).toUpperCase();
                  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                  const formattedDate = new Date(ticket.createdAt).toLocaleDateString('en-US', dateOptions);
                  
                  return (
                    <div key={ticket._id} className={styles.orderCard} style={{ cursor: 'pointer' }} onClick={() => router.push(`/profile/tickets/${ticket._id}`)}>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderId}>{ticket.subject}</span>
                        <span className={styles.orderDate}>Ticket #{ticketIdDisplay} &bull; Created on {formattedDate}</span>
                        <span className={styles.orderDate}>Category: {ticket.category}</span>
                      </div>
                      <div className={styles.orderStatusWrapper}>
                        <span className={`${styles.statusBadge}`} style={{ 
                          backgroundColor: ticket.status === 'Resolved' || ticket.status === 'Closed' ? '#e6f4ea' : ticket.status === 'In Progress' ? '#e8f0fe' : '#fce8e6',
                          color: ticket.status === 'Resolved' || ticket.status === 'Closed' ? '#1e8e3e' : ticket.status === 'In Progress' ? '#1a73e8' : '#d93025'
                         }}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* LEFT SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.profileOverview}>
            <div className={styles.avatarWrapper} onClick={() => document.getElementById('avatarInput').click()}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
              ) : (
                <IconUser />
              )}
              <div className={styles.avatarOverlay}>Change Photo</div>
              <input type="file" accept="image/*" id="avatarInput" className={styles.avatarInput} onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const dataUrl = ev.target.result;
                    setAvatarUrl(dataUrl);
                    localStorage.setItem('profileAvatar', dataUrl);
                  };
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
            <h2 className={styles.userName}>{user.name || 'User'}</h2>
            <span className={styles.userBadge}>Premium Member</span>
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}><IconMail /></span>
              <span>{user.email}</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}><IconPhone /></span>
              <span>{phone}</span>
            </div>
          </div>

          <nav className={styles.navLinks}>
            <div className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('orders')}>
              <span className={styles.navItemIcon}><IconPackage /></span> My Orders
            </div>
            <div className={`${styles.navItem} ${activeTab === 'wishlist' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('wishlist')}>
              <span className={styles.navItemIcon}><IconHeart /></span> Wishlist
            </div>
            <div className={`${styles.navItem} ${activeTab === 'addresses' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('addresses')}>
              <span className={styles.navItemIcon}><IconMapPin /></span> Addresses
            </div>
            <div className={`${styles.navItem} ${activeTab === 'rewards' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('rewards')}>
              <span className={styles.navItemIcon}><IconGift /></span> Rewards
            </div>
            <div className={`${styles.navItem} ${activeTab === 'support' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('support')}>
              <span className={styles.navItemIcon}><IconSupport /></span> Support
            </div>
            <div className={`${styles.navItem} ${activeTab === 'settings' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('settings')}>
              <span className={styles.navItemIcon}><IconSettings /></span> Settings
            </div>
          </nav>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => setActiveTab('editProfile')}>Edit Profile</button>
            <button className={styles.btnLogout} onClick={logout}>Logout</button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className={styles.mainContent}>
          {renderContent()}
        </main>

      </div>
    </div>
  );
}
