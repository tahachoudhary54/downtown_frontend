'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const RealtimeStockContext = createContext();

export function RealtimeStockProvider({ children }) {
  const [stocks, setStocks] = useState({});

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl);

    socket.on('stock_updated', (data) => {
      setStocks(prev => ({
        ...prev,
        [data.productId]: data.stock
      }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <RealtimeStockContext.Provider value={stocks}>
      {children}
    </RealtimeStockContext.Provider>
  );
}

export function useLiveStock(productId, initialStock) {
  const stocks = useContext(RealtimeStockContext);
  return stocks && stocks[productId] !== undefined ? stocks[productId] : initialStock;
}
