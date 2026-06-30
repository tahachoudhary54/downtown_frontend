'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function usePolicy(policyKey, defaultData) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch(`${API_URL}/api/policies?_t=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        
        if (json.success && json.data && json.data[policyKey]) {
          try {
            // Admin text should be valid JSON
            const policyData = json.data[policyKey];
            if (typeof policyData === 'object' && policyData !== null) {
              setData(policyData);
            } else {
              const parsed = JSON.parse(policyData);
              setData(parsed);
            }
          } catch (e) {
            // If it's not valid JSON, check if we expected a string
            if (typeof defaultData === 'string') {
              setData(json.data[policyKey]);
            } else {
              // Expected object/array, but got invalid JSON. Fallback to default to prevent crash.
              setData(defaultData);
            }
          }
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
    socket.on('policies_updated', (updatedData) => {
      if (updatedData && updatedData[policyKey] !== undefined) {
        try {
          const policyData = updatedData[policyKey];
          if (typeof policyData === 'object' && policyData !== null) {
            setData(policyData);
          } else {
            const parsed = JSON.parse(policyData);
            setData(parsed);
          }
        } catch (e) {
          if (typeof defaultData === 'string') {
            setData(updatedData[policyKey]);
          } else {
            setData(defaultData);
          }
        }
      }
    });

    return () => socket.disconnect();
  }, [policyKey]);

  return { data, loading };
}
