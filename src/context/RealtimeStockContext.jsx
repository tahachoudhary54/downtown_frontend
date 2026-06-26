'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const RealtimeStockContext = createContext();

export function RealtimeStockProvider({ children }) {
  const [stocks, setStocks] = useState({});
  const [visibilities, setVisibilities] = useState({});
  const [variants, setVariants] = useState({});
  const [deleted, setDeleted] = useState({});
  const [prices, setPrices] = useState({});
  const [salePrices, setSalePrices] = useState({});

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl);

    socket.on('stock_updated', (data) => {
      // Update stock count
      if (data.stock !== undefined) {
        setStocks((prev) => ({ ...prev, [data.productId]: data.stock }));
      }
      // Update in‑stock visibility
      if (data.inStock !== undefined) {
        setVisibilities((prev) => ({ ...prev, [data.productId]: data.inStock }));
      }
      // Update variant list
      if (data.variants !== undefined) {
        setVariants((prev) => ({ ...prev, [data.productId]: data.variants }));
      }
      // Update price
      if (data.price !== undefined) {
        setPrices((prev) => ({ ...prev, [data.productId]: data.price }));
      }
      // Update sale price
      if (data.salePrice !== undefined) {
        setSalePrices((prev) => ({ ...prev, [data.productId]: data.salePrice }));
      }
      // Mark as deleted when the product is out of stock, not visible, and has no variants
      if (
        data.stock === 0 &&
        data.inStock === false &&
        (Array.isArray(data.variants) ? data.variants.length === 0 : true)
      ) {
        setDeleted((prev) => ({ ...prev, [data.productId]: true }));
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <RealtimeStockContext.Provider
      value={{ stocks, visibilities, variants, deleted, prices, salePrices }}
    >
      {children}
    </RealtimeStockContext.Provider>
  );
}

export function useLiveStock(productId, initialStock) {
  const ctx = useContext(RealtimeStockContext);
  const stocks = ctx ? ctx.stocks : {};
  return stocks && stocks[productId] !== undefined ? stocks[productId] : initialStock;
}

export function useLiveVisibility(productId, initialVisibility) {
  const ctx = useContext(RealtimeStockContext);
  const vis = ctx ? ctx.visibilities : {};
  return vis && vis[productId] !== undefined ? vis[productId] : initialVisibility;
}

export function useLiveVariants(productId, initialVariants) {
  const ctx = useContext(RealtimeStockContext);
  const vars = ctx ? ctx.variants : {};
  return vars && vars[productId] !== undefined ? vars[productId] : initialVariants;
}

export function useLiveDeleted(productId) {
  const ctx = useContext(RealtimeStockContext);
  const del = ctx ? ctx.deleted : {};
  return !!(del && del[productId]);
}

export function useLivePrice(productId, initialPrice) {
  const ctx = useContext(RealtimeStockContext);
  const priceMap = ctx ? ctx.prices : {};
  return priceMap && priceMap[productId] !== undefined ? priceMap[productId] : initialPrice;
}

export function useLiveSalePrice(productId, initialSalePrice) {
  const ctx = useContext(RealtimeStockContext);
  const saleMap = ctx ? ctx.salePrices : {};
  return saleMap && saleMap[productId] !== undefined ? saleMap[productId] : initialSalePrice;
}

export function useAllLiveStocks() {
  const ctx = useContext(RealtimeStockContext);
  return ctx ? ctx.stocks : {};
}
