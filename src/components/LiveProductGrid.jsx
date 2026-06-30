'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const fetcher = (url) => fetch(url).then(res => res.json()).then(res => ({
  products: res.data || [],
  pagination: res.pagination || null
}));

export default function LiveProductGrid({ initialProducts, queryParams, emptyMessage, initialPagination }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [mobileProducts, setMobileProducts] = useState(initialProducts);
  const [mobilePage, setMobilePage] = useState(1);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const limit = isMobile ? 20 : (isTablet ? 16 : 24);
  const currentPageParam = searchParams.get('page') || 1;
  const page = isMobile ? mobilePage : currentPageParam;

  const currentParams = { ...queryParams, limit, page };
  // Remove limit from queryParams if it exists so we can override it safely
  delete currentParams.limit;
  currentParams.limit = limit;

  const queryString = new URLSearchParams(currentParams).toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products${queryString ? `?${queryString}` : ''}`;
  
  const { data, isValidating } = useSWR(url, fetcher, {
    fallbackData: { products: initialProducts, pagination: initialPagination },
    revalidateOnFocus: false, // Prevents layout jumps when switching tabs
  });

  // Effect to handle mobile product accumulation and reset on filter change
  useEffect(() => {
    if (!mounted || !isMobile) return;

    if (mobilePage === 1) {
      setMobileProducts(data?.products || []);
    } else if (data?.products) {
      setMobileProducts(prev => {
        const newArr = [...prev];
        data.products.forEach(p => {
          if (!newArr.some(existing => (existing._id || existing.id) === (p._id || p.id))) {
            newArr.push(p);
          }
        });
        return newArr;
      });
    }
  }, [data, isMobile, mobilePage, mounted]);

  // Reset mobile page when filters change
  useEffect(() => {
    if (mounted && isMobile) {
      setMobilePage(1);
    }
  }, [searchParams.get('search'), searchParams.get('category'), searchParams.get('sort'), searchParams.get('inStock'), searchParams.get('minPrice'), searchParams.get('maxPrice')]);

  const displayProducts = !mounted ? initialProducts : (isMobile ? mobileProducts : (data?.products || initialProducts));
  const currentPagination = data?.pagination || initialPagination;

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLoadMore = () => {
    setMobilePage(prev => prev + 1);
  };

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
        <p>{emptyMessage || "No products found."}</p>
      </div>
    );
  }

  const hasNextPage = currentPagination?.hasNextPage;

  return (
    <>
      <ProductGrid products={displayProducts} isLoading={isValidating && !isMobile} />
      
      {mounted && !isMobile && (
        <Pagination pagination={currentPagination} onPageChange={handlePageChange} />
      )}

      {mounted && isMobile && hasNextPage && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
          <button 
            onClick={handleLoadMore}
            disabled={isValidating}
            style={{
              padding: '1rem 3rem',
              backgroundColor: 'var(--foreground)',
              color: 'var(--background)',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'var(--font-inter)',
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: isValidating ? 'not-allowed' : 'pointer',
              opacity: isValidating ? 0.7 : 1,
              transition: 'opacity 0.3s'
            }}
          >
            {isValidating ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </>
  );
}
