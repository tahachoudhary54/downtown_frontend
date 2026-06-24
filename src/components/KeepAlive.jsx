'use client';

import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function KeepAlive() {
  useEffect(() => {
    // Immediately ping on first load to wake up Render
    const ping = () => {
      fetch(`${API_URL}/`)
        .then(() => console.log('[KeepAlive] Backend is awake'))
        .catch(() => console.log('[KeepAlive] Backend waking up...'));
    };

    ping(); // Ping immediately on page load

    // Then ping every 10 minutes to keep Render from sleeping
    const interval = setInterval(ping, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // Renders nothing
}
