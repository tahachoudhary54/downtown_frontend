"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "../hooks/useSettings";
import styles from "./HeroSlider.module.css";

export default function HeroSlider({ initialSettings }) {
  const { settings } = useSettings(initialSettings);
  
  const heroSettings = settings?.hero || {
    slides: ["/hero_bg.png", "/hero_bg_v4.png", "/hero_bg_v6.png"],
    title: "ELEVATE YOUR\nEVERYDAY",
    subtitle: "Discover the new standard of modern luxury menswear. Designed for the discerning individual.",
    buttonText: "Shop Collection",
    buttonLink: "/shop"
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroSettings.slides.length);
    }, 5000); // 5 seconds
    
    return () => clearInterval(timer);
  }, [heroSettings.slides.length]);

  return (
    <section className={styles.hero}>
      {heroSettings.slides.map((src, index) => (
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
        <h1 className={styles.heroTitle}>
          {heroSettings.title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h1>
        <p className={styles.heroSubtitle}>{heroSettings.subtitle}</p>
        <div className={styles.heroButtons}>
          <Link href={heroSettings.buttonLink} className={styles.btnPrimary}>{heroSettings.buttonText}</Link>
        </div>
      </div>

    </section>
  );
}
