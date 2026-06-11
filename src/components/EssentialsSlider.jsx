"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from '../hooks/useSettings';
import styles from '../app/page.module.css';

import { categories as defaultCategories } from '../data/categories';

export default function EssentialsSlider({ initialSettings }) {
  const { settings } = useSettings(initialSettings);
  const categories = settings?.categories;
  
  const sliderRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const activeCategories = (categories && Array.isArray(categories) && categories.length > 0 ? categories : defaultCategories)
    .filter(c => c.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
  // Duplicate categories to create a longer scroll experience
  const extendedCategories = [...activeCategories, ...activeCategories, ...activeCategories];

  useEffect(() => {
    const smoothScrollTo = (element, target, duration) => {
      const start = element.scrollLeft;
      const change = target - start;
      const startTime = performance.now();

      element.style.scrollBehavior = 'auto';
      element.style.scrollSnapType = 'none';

      // smooth cubic-bezier style easing (easeInOutCubic)
      const easeInOutCubic = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
      };

      const animateScroll = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
          element.scrollLeft = easeInOutCubic(elapsedTime, start, change, duration);
          requestAnimationFrame(animateScroll);
        } else {
          element.scrollLeft = target;
          element.style.scrollSnapType = 'x mandatory';
          element.style.scrollBehavior = 'smooth';
        }
      };

      requestAnimationFrame(animateScroll);
    };

    let interval;
    if (!isDragging && !isHovered) {
      interval = setInterval(() => {
        if (sliderRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
          const track = sliderRef.current.children[0];
          
          if (track && track.children.length > 0) {
            const cardWidth = track.children[0].getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(track).gap) || 0;
            const scrollAmount = cardWidth + gap;

            if (scrollLeft + clientWidth >= scrollWidth - 10) {
              sliderRef.current.style.scrollBehavior = 'auto';
              sliderRef.current.style.scrollSnapType = 'none';
              sliderRef.current.scrollLeft = 0;
              requestAnimationFrame(() => {
                if (sliderRef.current) {
                  sliderRef.current.style.scrollBehavior = 'smooth';
                  sliderRef.current.style.scrollSnapType = 'x mandatory';
                }
              });
            } else {
              const currentSnapIndex = Math.round(scrollLeft / scrollAmount);
              const nextTarget = (currentSnapIndex + 1) * scrollAmount;
              smoothScrollTo(sliderRef.current, nextTarget, 800);
            }
          }
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isDragging, isHovered]);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
    } else {
      const progress = (scrollLeft / maxScroll) * 100;
      setScrollProgress(progress);
    }
  };

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    // disable scroll snap while dragging for smoother feel
    sliderRef.current.style.scrollSnapType = 'none';
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
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

      <div className={styles.sliderWrapper}>
        <div
          className={styles.sliderViewport}
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={(e) => { handleMouseLeave(); setIsHovered(false); }}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className={styles.sliderTrack}>
            {extendedCategories.map((cat, index) => (
              <div key={`${cat.id}-${index}`} className={styles.editorialCard}>
                <div className={styles.editorialImageWrapper}>
                  <Image src={cat.img} alt={cat.name} fill className={styles.editorialImage} draggable={false} />
                </div>
                <div className={styles.editorialContent}>
                  <h3 className={styles.editorialTitle}>{cat.name}</h3>
                  <div className={styles.editorialCtaWrapper}>
                    <Link href={`/clothing/${cat.slug}`} className={styles.editorialLink} draggable={false}>
                      Explore Collection &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className={styles.sliderProgressContainer}>
          <div 
            className={styles.sliderProgressBar} 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
