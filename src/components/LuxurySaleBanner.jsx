'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from '../hooks/useSettings';
import styles from './LuxurySaleBanner.module.css';

export default function LuxurySaleBanner({ initialSettings }) {
  const { settings } = useSettings(initialSettings);
  
  const seasonalSettings = settings?.seasonalBanner || {
    enabled: true,
    title: "AUTUMN EDIT 2025\nUP TO 50% OFF",
    image: "/hero_bg.png",
    buttonText: "SHOP COLLECTION",
    buttonLink: "/shop"
  };

  if (!seasonalSettings.enabled) return null;

  const lines = (seasonalSettings.title || "AUTUMN EDIT 2025\nUP TO 50% OFF").split('\n');
  const mainTitle = lines[0] || 'AUTUMN EDIT 2025';
  const offerLine = lines.slice(1).join(' ') || 'UP TO 50% OFF';
  return (
    <section className={styles.heroSection}>
      {/* Left Text Content */}
      <div className={styles.leftCol}>
        <div className={styles.newSeasonLabel}>
          NEW SEASON
          <div className={styles.goldLine}></div>
        </div>
        
        <h1 className={styles.headline}>
          {mainTitle.split(' ').map((word, i, arr) => (
            <React.Fragment key={i}>
              {word}{i === Math.floor(arr.length / 2) - 1 ? <br /> : ' '}
            </React.Fragment>
          ))}
        </h1>
        
        <h2 className={styles.subheading}>TIMELESS STYLE. MODERN ESSENTIALS.</h2>
        
        <p className={styles.description}>
          Elevated wardrobe staples, crafted<br />for the modern gentleman.
        </p>

        <div className={styles.offerWrapper}>
          {offerLine.toUpperCase().split(/(\d+%?)/).map((part, i) => 
            /\d+/.test(part) ? <span key={i} className={styles.offerHighlight}>{part}</span> : part
          )}
        </div>

        <Link href={seasonalSettings.buttonLink || '/shop'} className={styles.ctaButton}>
          {seasonalSettings.buttonText || 'SHOP COLLECTION'} <span className={styles.ctaArrow}>→</span>
        </Link>

      </div>

      {/* Right Image Content */}
      <div className={styles.rightCol}>
        <Image
          src={seasonalSettings.image || '/hero_bg.png'}
          alt={mainTitle}
          fill
          priority
          className={styles.heroImage}
        />
      </div>
    </section>
  );
}
