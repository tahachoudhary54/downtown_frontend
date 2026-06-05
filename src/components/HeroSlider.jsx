"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSlider.module.css";

const slides = [
  "/hero_bg.png",
  "/hero_bg_v4.png",
  "/hero_bg_v6.png"
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); // 5 seconds
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero}>
      {slides.map((src, index) => (
        <div
          key={src}
          className={`${styles.heroSlide} ${index === currentIndex ? styles.active : ''}`}
        >
          <div className={styles.heroBackground}>
            <Image
              src={src}
              alt="Hero background"
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
            />
          </div>
          <div className={styles.heroOverlay}></div>
        </div>
      ))}
      
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>ELEVATE YOUR<br />EVERYDAY</h1>
        <p className={styles.heroSubtitle}>Discover the new standard of modern luxury menswear. Designed for the discerning individual.</p>
        <div className={styles.heroButtons}>
          <Link href="/shop" className={styles.btnPrimary}>Shop Collection</Link>
        </div>
      </div>

    </section>
  );
}
