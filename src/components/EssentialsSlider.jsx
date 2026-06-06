"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from '../hooks/useSettings';
import styles from '../app/page.module.css';

import { categories as defaultCategories } from '../data/categories';

export default function EssentialsSlider({ initialSettings }) {
  const { settings } = useSettings(initialSettings);
  const categories = settings?.categories || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // We duplicate the array to create a seamless looping effect
  const activeCategories = (categories && Array.isArray(categories) ? categories : defaultCategories)
    .filter(c => c.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
  const extendedCategories = [...activeCategories, ...activeCategories, ...activeCategories];

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= activeCategories.length) {
        return 0;
      }
      return prev + 1;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return activeCategories.length - 1;
      }
      return prev - 1;
    });
  };

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsHovered(true); // Pause on touch
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    setIsHovered(false); // Resume after touch
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <section className={styles.sectionContainer} style={{ position: 'relative' }}>
      <div className={styles.sectionHeaderCol}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--foreground)' }}></div>
          <h2 className={styles.sectionTitle} style={{ paddingRight: 0, margin: 0 }}>ESSENTIAL COLLECTIONS</h2>
          <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--foreground)' }}></div>
        </div>
        <p className={styles.sectionSubtitle}>Everyday Luxury</p>
      </div>

      <div
        className={styles.sliderWrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button 
          className={`${styles.navArrow} ${styles.navArrowLeft}`} 
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div className={styles.sliderViewport}>
          <div
            className={styles.sliderTrack}
            style={{
              transform: `translateX(calc(-${currentIndex * 25}% - ${currentIndex * 0.75}rem))`,
              transition: 'transform 2s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            {extendedCategories.map((cat, index) => (
              <div key={`${cat.id}-${index}`} className={styles.editorialCard}>
                <div className={styles.editorialImageWrapper}>
                  <Image src={cat.img} alt={cat.name} fill className={styles.editorialImage} />
                </div>
                <div className={styles.editorialContent}>
                  <h3 className={styles.editorialTitle}>{cat.name}</h3>
                  <div className={styles.editorialCtaWrapper}>
                    <Link href={`/clothing/${cat.slug}`} className={styles.editorialLink}>
                      Explore Collection &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          className={`${styles.navArrow} ${styles.navArrowRight}`} 
          onClick={handleNext}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </section>
  );
}
