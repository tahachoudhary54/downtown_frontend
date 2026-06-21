'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '../app/page.module.css';

export default function ShopFilters({ categories = [], categoryCounts = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '10000');

  // Sync local state if URL changes externally
  useEffect(() => {
    setMaxPrice(searchParams.get('maxPrice') || '10000');
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === 'maxPrice' && value === '10000') {
      params.delete('maxPrice');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const categoryOptions = ['', ...categories];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ padding: '0.8rem 1.5rem', background: 'var(--foreground)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', border: 'none', borderRadius: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filter Products
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      {/* Slide-out Panel */}
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
          
          {/* Category Filter */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
              Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categoryOptions.map((cat) => {
                const isActive = (searchParams.get('category') || '') === cat;
                const count = cat === '' ? '' : (categoryCounts[cat.toLowerCase()] || 0);
                const isDisabled = cat !== '' && count === 0;

                return (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: '0.95rem', color: isActive ? 'var(--foreground)' : (isDisabled ? '#aaa' : '#555'), fontWeight: isActive ? 600 : 400, opacity: isDisabled ? 0.6 : 1 }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={isActive} 
                      disabled={isDisabled}
                      onChange={() => !isDisabled && handleFilterChange('category', cat)} 
                      style={{ accentColor: 'var(--foreground)', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                    />
                    {cat === '' ? 'All Categories' : `${cat} (${count})`}
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
            />
          </div>

          {/* Status Filter */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
              Availability
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', color: '#555' }}>
              <input 
                type="checkbox" 
                checked={searchParams.get('sale') === 'true'}
                onChange={(e) => handleFilterChange('sale', e.target.checked ? 'true' : '')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--foreground)', cursor: 'pointer' }}
              />
              Sale Items Only
            </label>
          </div>

        </div>
      </div>
    </>
  );
}
