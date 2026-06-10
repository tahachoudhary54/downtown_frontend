'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { mutate } from 'swr';

export function useRealtimeStock() {
  useEffect(() => {
    // Only connect in browser environment
    if (typeof window === 'undefined') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl);

    socket.on('connect', () => {
      console.log('🔗 Connected to realtime stock service');
    });

    socket.on('stock_updated', (data) => {
      console.log('📦 Realtime stock update received:', data);
      
      // We mutate global SWR caches that might hold product data
      // This forces components using SWR to re-fetch the latest stock instantly
      
      // 1. Mutate individual product cache
      mutate(`${apiUrl}/api/products/${data.productId}`);
      
      // 2. Mutate global products list cache (using a partial matcher or mutating the known key)
      // Since SWR keys for product lists usually look like `${apiUrl}/api/products?page=1&limit=10`
      // We can use SWR's global mutate with a matcher function if using swr >= 2.0
      // For now, we will simply mutate the generic endpoint prefix if possible, or trigger a full revalidation.
      
      mutate(
        (key) => typeof key === 'string' && key.startsWith(`${apiUrl}/api/products`),
        undefined, // don't provide optimistic data for complex lists, just revalidate
        { revalidate: true }
      );
    });

    socket.on('disconnect', () => {
      console.log('🔗 Disconnected from realtime stock service');
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
