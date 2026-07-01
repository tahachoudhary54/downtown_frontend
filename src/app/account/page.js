'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCustomerNotifications } from '@/context/CustomerNotificationsContext';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import styles from './account.module.css';

import { Suspense } from 'react';

function AccountContent() {
  const { token, user: authUser, loading, checkUser } = useAuth();
  const { notifications, deleteNotification } = useCustomerNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Active Tab
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (mounted) {
      const tab = searchParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [searchParams, mounted]);

  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: '', street: '', city: '', state: '', zip: '', phone: '' });
  const [savingAddress, setSavingAddress] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ text: '', type: '' });

  // Support Tickets State
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'Payment Issue', description: '' });
  const [savingTicket, setSavingTicket] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketReply, setTicketReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetcher = (url) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

  const { data: userData, mutate: mutateUser } = useSWR(
    token && (activeTab === 'profile' || activeTab === 'addresses') ? `${apiBase}/api/users/me` : null,
    fetcher
  );

  const { data: ticketsData, mutate: mutateTickets } = useSWR(
    token && activeTab === 'support' ? `${apiBase}/api/tickets/my-tickets` : null,
    fetcher
  );

  const { data: singleTicketData, mutate: mutateSingleTicket } = useSWR(
    token && selectedTicketId ? `${apiBase}/api/tickets/${selectedTicketId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && !authUser) router.push('/login');
  }, [loading, authUser, router]);

  useEffect(() => {
    if (userData?.data) {
      setName(userData.data.name || '');
      setEmail(userData.data.email || '');
      setAddresses(userData.data.addresses || []);
    }
  }, [userData]);

  if (!mounted || loading || !authUser) return null;

  // -- Handlers --
  // Profile updates are currently disabled.

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setSecurityMsg({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      return setSecurityMsg({ text: 'New passwords do not match.', type: 'error' });
    }
    setSavingSecurity(true);
    try {
      const res = await fetch(`${apiBase}/api/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const resData = await res.json();
      if (resData.success) {
        setSecurityMsg({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityMsg({ text: resData.message || 'Failed to update password', type: 'error' });
      }
    } catch (err) {
      setSecurityMsg({ text: 'An error occurred.', type: 'error' });
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await fetch(`${apiBase}/api/users/me/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAddress)
      });
      if (res.ok) {
        mutateUser();
        setShowAddAddress(false);
        setNewAddress({ fullName: '', street: '', city: '', state: '', zip: '', phone: '' });
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add address');
      }
    } catch (err) {
      alert('Error saving address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await fetch(`${apiBase}/api/users/me/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      mutateUser();
    } catch (err) {
      alert('Error deleting address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await fetch(`${apiBase}/api/users/me/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      mutateUser();
    } catch (err) {
      alert('Error setting default address');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setTicketError('');
    setSavingTicket(true);
    try {
      const res = await fetch(`${apiBase}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        mutateTickets();
        setShowAddTicket(false);
        setNewTicket({ subject: '', category: 'Payment Issue', description: '' });
      } else {
        const data = await res.json();
        setTicketError(data.message || 'Failed to create ticket');
      }
    } catch (err) {
      setTicketError('Error creating ticket');
    } finally {
      setSavingTicket(false);
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`${apiBase}/api/tickets/${selectedTicketId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: ticketReply })
      });
      if (res.ok) {
        setTicketReply('');
        mutateSingleTicket();
        mutateTickets();
      } else {
        alert('Failed to send reply');
      }
    } catch (err) {
      alert('Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  const tickets = ticketsData?.data || [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Account</h1>
        
        <div className={styles.dashboard}>
          {/* Sidebar Navigation */}
          <aside className={styles.sidebar}>
            <button className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => setActiveTab('profile')}>Profile Information</button>
            <button className={`${styles.tabButton} ${activeTab === 'addresses' ? styles.active : ''}`} onClick={() => setActiveTab('addresses')}>Saved Addresses</button>
            <button className={`${styles.tabButton} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
            <button className={`${styles.tabButton} ${activeTab === 'support' ? styles.active : ''}`} onClick={() => setActiveTab('support')}>Support / Help Center</button>
            <button className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`} onClick={() => setActiveTab('security')}>Security Settings</button>
          </aside>

          {/* Main Content Area */}
          <main className={styles.content}>
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Profile Information</h2>
                <div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input type="text" value={name} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed' }} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" value={email} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed' }} />
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <h2 className={styles.cardTitle} style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>Saved Addresses</h2>
                  {!showAddAddress && (
                    <button onClick={() => setShowAddAddress(true)} className={styles.addressActionBtn}>+ Add New Address</button>
                  )}
                </div>

                {showAddAddress ? (
                  <form onSubmit={handleAddAddress}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name</label>
                      <input type="text" value={newAddress.fullName} onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} className={styles.input} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Street Address</label>
                      <input type="text" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className={styles.input} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>City</label>
                        <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className={styles.input} required />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>State</label>
                        <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className={styles.input} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>ZIP Code</label>
                        <input type="text" value={newAddress.zip} onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} className={styles.input} required />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Phone Number</label>
                        <input type="text" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className={styles.input} required />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="submit" className={styles.button} disabled={savingAddress}>Save Address</button>
                      <button type="button" className={`${styles.button} ${styles.btnSecondary}`} onClick={() => setShowAddAddress(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {addresses.length === 0 ? (
                      <p style={{ color: '#6b7280' }}>You don't have any saved addresses yet.</p>
                    ) : (
                      <div className={styles.addressList}>
                        {addresses.map(addr => (
                          <div key={addr._id} className={`${styles.addressCard} ${addr.isDefault ? styles.isDefault : ''}`}>
                            {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                            <div className={styles.addressName}>{addr.fullName}</div>
                            <div className={styles.addressDetails}>
                              {addr.street}<br/>
                              {addr.city}, {addr.state} {addr.zip}<br/>
                              Phone: {addr.phone}
                            </div>
                            <div className={styles.addressActions}>
                              {!addr.isDefault && (
                                <button onClick={() => handleSetDefaultAddress(addr._id)} className={styles.addressActionBtn}>Set as Default</button>
                              )}
                              <button onClick={() => handleDeleteAddress(addr._id)} className={`${styles.addressActionBtn} ${styles.deleteBtn}`}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Notifications</h2>
                {notifications.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>You have no notifications.</p>
                ) : (
                  <div className={styles.notifList}>
                    {notifications.map(notif => (
                      <div key={notif._id} className={styles.notifItem}>
                        <div className={styles.notifHeader}>
                          <span className={styles.notifTitle}>{notif.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className={styles.notifTime}>
                              {new Date(notif.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button 
                              onClick={() => {
                                if(confirm('Are you sure you want to delete this notification?')) {
                                  deleteNotification(notif._id);
                                }
                              }} 
                              className={styles.addressActionBtn} 
                              style={{ color: '#dc2626' }}
                              title="Delete notification"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className={styles.notifMessage}>{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUPPORT TAB */}
            {activeTab === 'support' && (
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <h2 className={styles.cardTitle} style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>Support Tickets</h2>
                  {!showAddTicket && (
                    <button onClick={() => setShowAddTicket(true)} className={styles.addressActionBtn}>Create New Ticket</button>
                  )}
                </div>

                {showAddTicket ? (
                  <form onSubmit={handleCreateTicket}>
                    {ticketError && (
                      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        {ticketError}
                      </div>
                    )}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Subject</label>
                      <input type="text" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} className={styles.input} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Category</label>
                      <select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} className={styles.input} required>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Wrong Product">Wrong Product</option>
                        <option value="Damaged Product">Damaged Product</option>
                        <option value="Return Request">Return Request</option>
                        <option value="Refund Request">Refund Request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Description</label>
                      <textarea value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className={styles.textarea} required></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="submit" className={styles.button} disabled={savingTicket}>Submit Ticket</button>
                      <button type="button" className={`${styles.button} ${styles.btnSecondary}`} onClick={() => setShowAddTicket(false)}>Cancel</button>
                    </div>
                  </form>
                ) : selectedTicketId ? (
                  <div>
                    <button onClick={() => setSelectedTicketId(null)} className={styles.addressActionBtn} style={{ marginBottom: '16px' }}>← Back to Tickets</button>
                    {!singleTicketData ? (
                      <p>Loading ticket details...</p>
                    ) : (
                      <div>
                        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{singleTicketData.data.subject}</h3>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', alignItems: 'center' }}>
                            <span>#{singleTicketData.data._id.slice(-6).toUpperCase()}</span>
                            <span>•</span>
                            <span>{singleTicketData.data.category}</span>
                            <span>•</span>
                            <span className={`${styles.ticketStatus} ${styles[singleTicketData.data.status.toLowerCase().replace(' ', '-')] || ''}`} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px' }}>{singleTicketData.data.status}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                          {singleTicketData.data.messages.map((msg, i) => (
                            <div key={i} style={{ alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: msg.sender === 'customer' ? '#FAF8F5' : '#f3f4f6', padding: '12px 16px', borderRadius: '12px', border: msg.sender === 'customer' ? '1px solid var(--border)' : 'none' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>{msg.sender === 'customer' ? 'You' : 'Downtown Support'} • {new Date(msg.createdAt).toLocaleString()}</div>
                              <div style={{ fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                            </div>
                          ))}
                        </div>

                        {singleTicketData.data.status !== 'Closed' && (
                          <form onSubmit={handleReplyTicket} style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <textarea 
                              value={ticketReply} 
                              onChange={(e) => setTicketReply(e.target.value)} 
                              placeholder="Type your reply here..." 
                              className={styles.textarea} 
                              style={{ minHeight: '80px', marginBottom: '12px' }} 
                              required 
                            />
                            <button type="submit" className={styles.button} disabled={sendingReply}>
                              {sendingReply ? 'Sending...' : 'Send Reply'}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {tickets.length === 0 ? (
                      <p style={{ color: '#6b7280' }}>You haven't submitted any support tickets yet.</p>
                    ) : (
                      <div className={styles.ticketList}>
                        {tickets.map(ticket => (
                          <div 
                            key={ticket._id} 
                            className={styles.ticketItem}
                            onClick={() => setSelectedTicketId(ticket._id)}
                            style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAF8F5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className={styles.ticketMain}>
                              <span className={styles.ticketSubject}>{ticket.subject}</span>
                              <span className={styles.ticketMeta}>
                                #{ticket._id.slice(-6).toUpperCase()} • {ticket.category} • Updated {new Date(ticket.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`${styles.ticketStatus} ${styles[ticket.status.toLowerCase().replace(' ', '-')] || ''}`}>
                              {ticket.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Security Settings</h2>
                <form onSubmit={handleSecuritySubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Current Password</label>
                    <div className={styles.passwordWrapper}>
                      <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={styles.input} required />
                      <button type="button" className={styles.eyeButton} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                        {showCurrentPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>New Password</label>
                    <div className={styles.passwordWrapper}>
                      <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={styles.input} required minLength={6} />
                      <button type="button" className={styles.eyeButton} onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Confirm New Password</label>
                    <div className={styles.passwordWrapper}>
                      <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={styles.input} required minLength={6} />
                      <button type="button" className={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className={styles.button} disabled={savingSecurity}>
                    {savingSecurity ? 'Updating...' : 'Update Password'}
                  </button>
                  {securityMsg.text && (
                    <div className={`${styles.message} ${styles[securityMsg.type]}`}>{securityMsg.text}</div>
                  )}
                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default function MyAccount() {
  return (
    <Suspense fallback={<div>Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
