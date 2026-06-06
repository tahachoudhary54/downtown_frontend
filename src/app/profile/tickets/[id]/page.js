'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import styles from '../../profile.module.css';

export default function TicketDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { token, user, loading } = useAuth();
  
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetcher = (url) => fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const { data, error, mutate } = useSWR(
    user && token ? `${apiBase}/api/tickets/${id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const ticket = data?.data;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/tickets/${id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: replyText })
      });
      const result = await res.json();
      if (result.success) {
        setReplyText('');
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket && !error) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading ticket details...</div>;
  }

  if (error || !ticket) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'red' }}>Ticket not found or unauthorized.</div>;
  }

  const ticketIdDisplay = ticket._id.slice(-6).toUpperCase();

  return (
    <div className={styles.page}>
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        
        <button 
          onClick={() => router.push('/profile')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          &larr; Back to Profile
        </button>

        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', color: 'var(--foreground)' }}>{ticket.subject}</h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Ticket #{ticketIdDisplay} &bull; Category: {ticket.category}
                {ticket.orderId && <span> &bull; Order Ref: {ticket.orderId}</span>}
              </div>
            </div>
            <span style={{ 
              padding: '0.4rem 1rem', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              backgroundColor: ticket.status === 'Resolved' || ticket.status === 'Closed' ? '#e6f4ea' : ticket.status === 'In Progress' ? '#e8f0fe' : '#fce8e6',
              color: ticket.status === 'Resolved' || ticket.status === 'Closed' ? '#1e8e3e' : ticket.status === 'In Progress' ? '#1a73e8' : '#d93025'
            }}>
              {ticket.status}
            </span>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ATTACHMENT</h4>
              <img src={ticket.attachments[0]} alt="Attachment" style={{ maxWidth: '150px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          )}

          {/* Messages */}
          <div style={{ padding: '2rem', background: '#FAF8F5', maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {ticket.messages.map((msg, idx) => {
              const isCustomer = msg.sender === 'customer';
              return (
                <div key={idx} style={{ alignSelf: isCustomer ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ 
                    padding: '1rem 1.5rem', 
                    borderRadius: '16px', 
                    background: isCustomer ? 'var(--accent)' : '#fff',
                    color: isCustomer ? '#fff' : 'var(--foreground)',
                    border: isCustomer ? 'none' : '1px solid var(--border)',
                    borderBottomRightRadius: isCustomer ? '4px' : '16px',
                    borderBottomLeftRadius: !isCustomer ? '4px' : '16px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.text}</p>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: isCustomer ? 'right' : 'left' }}>
                    {isCustomer ? 'You' : 'Support Team'} &bull; {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', background: '#fff' }}>
            {ticket.status === 'Closed' ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>This ticket has been closed. If you have a new issue, please open a new ticket.</p>
            ) : (
              <form onSubmit={handleReply} style={{ display: 'flex', gap: '1rem' }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none', background: '#FAF8F5' }}
                  rows="2"
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  style={{ 
                    padding: '0 2rem', 
                    background: 'var(--accent)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 600, 
                    cursor: (isSubmitting || !replyText.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (isSubmitting || !replyText.trim()) ? 0.7 : 1
                  }}
                >
                  Send
                </button>
              </form>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              Note: Replying to a resolved ticket will automatically reopen it.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
