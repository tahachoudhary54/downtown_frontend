'use client';

import useSWR from 'swr';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const fetcher = (url) => fetch(url).then(res => res.json()).then(res => ({
  products: res.data || [],
  pagination: res.pagination || null
}));

export default function LiveProductGrid({ initialProducts, queryParams, emptyMessage, initialPagination }) {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products${queryString ? `?${queryString}` : ''}`;
  
  const { data } = useSWR(url, fetcher, {
    fallbackData: { products: initialProducts, pagination: initialPagination },
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  const displayProducts = data?.products || initialProducts;
  const currentPagination = data?.pagination || initialPagination;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
        <p>{emptyMessage || "No products found."}</p>
      </div>
    );
  }

  return (
    <>
      <ProductGrid products={displayProducts} />
      <Pagination pagination={currentPagination} onPageChange={handlePageChange} />
    </>
  );
}
