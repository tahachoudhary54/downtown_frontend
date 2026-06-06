'use client';

import useSWR from 'swr';
import ProductGrid from './ProductGrid';

const fetcher = (url) => fetch(url).then(res => res.json()).then(res => res.data || []);

export default function LiveProductGrid({ initialProducts, queryParams, emptyMessage }) {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products${queryString ? `?${queryString}` : ''}`;
  
  const { data: products } = useSWR(url, fetcher, {
    fallbackData: initialProducts,
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  const displayProducts = products || initialProducts;

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
        <p>{emptyMessage || "No products found."}</p>
      </div>
    );
  }

  return <ProductGrid products={displayProducts} />;
}
