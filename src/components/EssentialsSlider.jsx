"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../app/page.module.css';

const categories = [
  { id: 1, name: 'CASUAL WEAR', img: '/cat_casual.png' },
  { id: 2, name: 'FORMAL WEAR', img: '/cat_formal.png' },
  { id: 3, name: 'STREET STYLE', img: '/cat_street.png' },
  { id: 4, name: 'OUTERWEAR', img: '/cat_outer.png' },
  { id: 5, name: 'ACCESSORIES', img: '/cat_acc.png' }
];

export default function EssentialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // We duplicate the array to create a seamless looping effect
  const extendedCategories = [...categories, ...categories, ...categories];

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // If we reach the end (categories.length - 1, but we need to account for showing 4 items)
        // Since we duplicated the array, we can just slide up to categories.length
        if (prev >= categories.length) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeaderCol}>
        <h2 className={styles.sectionTitle}>ESSENTIAL COLLECTIONS</h2>
        <p className={styles.sectionSubtitle}>Curated pieces designed for every occasion.</p>
      </div>
      
      <div 
        className={styles.sliderViewport}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={styles.sliderTrack}
          style={{ 
            transform: `translateX(calc(-${currentIndex * 25}% - ${currentIndex * 0.75}rem))`,
            transition: 'transform 3s cubic-bezier(0.25, 1, 0.5, 1)'
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
                  <a href="/shop" className={styles.editorialLink}>Explore Collection &rarr;</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
