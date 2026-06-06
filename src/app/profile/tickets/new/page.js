'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';
import styles from '../../profile.module.css';

function NewTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, loading } = useAuth();
  const { addNotification } = useNotifications();
  
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payment Issue');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments([ev.target.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          category,
          description,
          orderId,
          attachments
        })
      });

      const data = await res.json();
      if (data.success) {
        addNotification({
          title: 'New Support Ticket',
          desc: `${user?.name || 'Customer'} raised a ticket: ${subject}`,
          type: 'alert'
        });
        router.push('/profile'); // We could push directly to the ticket if we want
      } else {
        setError(data.message || 'Failed to create ticket.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            &larr; Back
          </button>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}>Create Support Ticket</h2>
          
          {error && <div style={{ padding: '1rem', background: '#fce8e6', color: '#d93025', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category *</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#FAF8F5' }}
              >
                <option>Payment Issue</option>
                <option>Delivery Issue</option>
                <option>Wrong Product</option>
                <option>Damaged Product</option>
                <option>Return Request</option>
                <option>Refund Request</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject *</label>
              <input 
                type="text" 
                required 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#FAF8F5' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Order Reference (Optional)</label>
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. Order #ID"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#FAF8F5' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>If this is related to a specific order, please include the ID.</span>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description *</label>
              <textarea 
                required 
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about your issue..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#FAF8F5', resize: 'vertical' }}
              ></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Attachment (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px dashed var(--border)', background: '#FAF8F5' }}
              />
              {attachments.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={attachments[0]} alt="Attachment Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ padding: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem' }}>Loading form...</div>}>
      <NewTicketForm />
    </Suspense>
  );
}
