'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import styles from '../app/page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PolicyPage({ title, policyKey }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch(`${API_URL}/api/policies?_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data && data.data[policyKey]) {
          setContent(data.data[policyKey]);
        }
      } catch (err) {
        console.error('Failed to fetch policy:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();

    // Listen for real-time updates
    const socket = io(API_URL);
    socket.on('policies_updated', (data) => {
      if (data && data[policyKey] !== undefined) {
        setContent(data[policyKey]);
      }
    });

    return () => socket.disconnect();
  }, [policyKey]);

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>{title.toUpperCase()}</h1>
          <div className={styles.sectionLine}></div>
        </div>
        <div style={{ padding: '2rem 0', lineHeight: '1.8', color: 'rgba(46,42,39,0.8)', minHeight: '400px' }}>
          {loading ? (
            <p className="animate-pulse">Loading policy...</p>
          ) : content ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
          ) : (
            <p>This policy is currently being updated. Please check back later.</p>
          )}
        </div>
      </section>
    </div>
  );
}
