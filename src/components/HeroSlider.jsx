"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSlider.module.css";

export default function HeroSlider({ slides, title, subtitle, buttonText, buttonLink }) {
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
        <h1 className={styles.heroTitle}>
          {title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h1>
        <p className={styles.heroSubtitle}>{subtitle}</p>
        <div className={styles.heroButtons}>
          <Link href={buttonLink} className={styles.btnPrimary}>{buttonText}</Link>
        </div>
      </div>

    </section>
  );
}
