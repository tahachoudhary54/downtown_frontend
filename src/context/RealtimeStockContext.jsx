'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const RealtimeStockContext = createContext();

export function RealtimeStockProvider({ children }) {
  const [stocks, setStocks] = useState({});
  const [visibilities, setVisibilities] = useState({});
  const [variants, setVariants] = useState({});

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl);

    socket.on('stock_updated', (data) => {
      setStocks(prev => ({
        ...prev,
        [data.productId]: data.stock
      }));
      if (data.inStock !== undefined) {
        setVisibilities(prev => ({
          ...prev,
          [data.productId]: data.inStock
        }));
      }
      if (data.variants !== undefined) {
        setVariants(prev => ({
          ...prev,
          [data.productId]: data.variants
        }));
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <RealtimeStockContext.Provider value={{ stocks, visibilities, variants }}>
      {children}
    </RealtimeStockContext.Provider>
  );
}

export function useLiveStock(productId, initialStock) {
  const context = useContext(RealtimeStockContext);
  const stocks = context ? context.stocks : {};
  return stocks && stocks[productId] !== undefined ? stocks[productId] : initialStock;
}

export function useLiveVariants(productId, initialVariants) {
  const context = useContext(RealtimeStockContext);
  const variants = context ? context.variants : {};
  return variants && variants[productId] !== undefined ? variants[productId] : initialVariants;
}

export function useLiveVisibility(productId, initialVisibility) {
  const context = useContext(RealtimeStockContext);
  const visibilities = context ? context.visibilities : {};
  return visibilities && visibilities[productId] !== undefined ? visibilities[productId] : initialVisibility;
}

export function useAllLiveStocks() {
  const context = useContext(RealtimeStockContext);
  return context ? context.stocks : {};
}
