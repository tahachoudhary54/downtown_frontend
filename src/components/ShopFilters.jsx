'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '../app/page.module.css';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function ShopFilters({ initialCategories = [], initialCollections = [], categoryCounts = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '10000');
  
  const activeCategory = searchParams.get('category') || '';
  const activeCollection = searchParams.get('collection') || '';
  const activeSubCategory = searchParams.get('subCategory') || '';

  const { data: categoriesData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories?activeOnly=true`, 
    fetcher, 
    { 
      fallbackData: { success: true, data: initialCategories },
      refreshInterval: 3000
    }
  );

  const { data: collectionsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections`, 
    fetcher, 
    { 
      fallbackData: { success: true, data: initialCollections },
      refreshInterval: 3000
    }
  );

  const queryParams = new URLSearchParams(searchParams);
  queryParams.set('limit', '50');
  if (!queryParams.has('page')) queryParams.set('page', '1');
  const productsUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?${queryParams.toString()}`;

  const { data: productsData } = useSWR(
    productsUrl,
    (url) => fetch(url).then(res => res.json()).then(res => ({ categoryCounts: res.categoryCounts || {} })),
    {
      fallbackData: { categoryCounts },
      refreshInterval: 3000,
    }
  );

  const liveCategoryCounts = productsData?.categoryCounts || categoryCounts;

  useEffect(() => {
    setMaxPrice(searchParams.get('maxPrice') || '10000');
  }, [searchParams]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === 'category') {
      params.delete('subCategory'); // reset subcategory when category changes
    }

    if (key === 'maxPrice' && value === '10000') {
      params.delete('maxPrice');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const categories = categoriesData?.data || [];
  const collections = collectionsData?.data || [];

  const activeCategoryObj = categories.find(c => c.name === activeCategory);
  const subCategories = activeCategoryObj?.subCategories || [];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ padding: '0.8rem 1.5rem', background: 'var(--foreground)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', border: 'none', borderRadius: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filter Products
      </button>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      <div style={{ 
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px', background: 'var(--background)', zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-in-out',
        boxShadow: isOpen ? '4px 0 15px rgba(0,0,0,0.1)' : 'none', padding: '2.5rem 2rem', overflowY: 'auto'
      }}>
        <button 
          onClick={() => setIsOpen(false)} 
          style={{ background: 'transparent', border: 'none', fontSize: '2rem', cursor: 'pointer', position: 'absolute', top: '1rem', right: '1.5rem', color: 'var(--foreground)' }}
        >
          &times;
        </button>
        <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', letterSpacing: '0.1em', marginBottom: '2.5rem' }}>FILTER OPTIONS</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Collections Filter */}
          {collections.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
                Collections
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: !activeCollection ? 'var(--foreground)' : '#555', fontWeight: !activeCollection ? 600 : 400 }}>
                  <input 
                    type="radio" 
                    name="collection" 
                    checked={!activeCollection} 
                    onChange={() => handleFilterChange('collection', '')} 
                    style={{ accentColor: 'var(--foreground)' }}
                  />
                  All Collections
                </label>
                {collections.map((col) => {
                  const isActive = activeCollection === col.name;
                  return (
                    <label key={col._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: isActive ? 'var(--foreground)' : '#555', fontWeight: isActive ? 600 : 400 }}>
                      <input 
                        type="radio" 
                        name="collection" 
                        checked={isActive} 
                        onChange={() => handleFilterChange('collection', col.name)} 
                        style={{ accentColor: 'var(--foreground)' }}
                      />
                      {col.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories Filter */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
              Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: !activeCategory ? 'var(--foreground)' : '#555', fontWeight: !activeCategory ? 600 : 400 }}>
                <input 
                  type="radio" 
                  name="category" 
                  checked={!activeCategory} 
                  onChange={() => handleFilterChange('category', '')} 
                  style={{ accentColor: 'var(--foreground)' }}
                />
                All Categories
              </label>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.name;
                const count = liveCategoryCounts[cat.name.toLowerCase()] || 0;
                // Don't disable dynamic categories if they are active (to allow unselecting/reselecting)
                const isDisabled = count === 0 && !isActive;

                return (
                  <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: '0.95rem', color: isActive ? 'var(--foreground)' : (isDisabled ? '#aaa' : '#555'), fontWeight: isActive ? 600 : 400, opacity: isDisabled ? 0.6 : 1 }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={isActive} 
                      disabled={isDisabled}
                      onChange={() => !isDisabled && handleFilterChange('category', cat.name)} 
                      style={{ accentColor: 'var(--foreground)', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                    />
                    {cat.name}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Slider */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
              Price
            </h3>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555' }}>
              <span>₹0</span>
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                Up to ₹{maxPrice === '10000' ? '10000+' : maxPrice}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <button 
                type="button"
                onClick={() => {
                  const newVal = Math.max(0, parseInt(maxPrice) - 100).toString();
                  setMaxPrice(newVal);
                  handleFilterChange('maxPrice', newVal);
                }}
                style={{ width: '28px', height: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '50%', cursor: 'pointer', color: 'var(--foreground)', fontSize: '1.2rem', lineHeight: 1 }}
              >
                -
              </button>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="100"
                value={maxPrice}
                className={styles.priceSlider}
                onChange={(e) => setMaxPrice(e.target.value)}
                onMouseUp={(e) => handleFilterChange('maxPrice', e.target.value)}
                onTouchEnd={(e) => handleFilterChange('maxPrice', e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                type="button"
                onClick={() => {
                  const newVal = Math.min(10000, parseInt(maxPrice) + 100).toString();
                  setMaxPrice(newVal);
                  handleFilterChange('maxPrice', newVal);
                }}
                style={{ width: '28px', height: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '50%', cursor: 'pointer', color: 'var(--foreground)', fontSize: '1.2rem', lineHeight: 1 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
              Availability
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: '#555' }}>
              <input 
                type="checkbox" 
                checked={searchParams.get('inStock') === 'true'}
                onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--foreground)', cursor: 'pointer' }}
              />
              In Stock Only
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: '#555', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={searchParams.get('sale') === 'true'}
                onChange={(e) => handleFilterChange('sale', e.target.checked ? 'true' : '')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--foreground)', cursor: 'pointer' }}
              />
              Sale Items Only
            </label>
          </div>

          {/* Sort Filter */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
              Sort By
            </h3>
            <select
              value={searchParams.get('sort') || 'newest'}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.95rem',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: 'var(--foreground)',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)'
              }}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="best-selling">Best Selling</option>
              <option value="most-popular">Most Popular</option>
            </select>
          </div>

        </div>
      </div>
    </>
  );
}
