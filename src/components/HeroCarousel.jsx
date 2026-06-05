"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../app/page.module.css';

const images = [
  "/midnight_final.png",
  "/hero_user_1.jpg",
  "/hero_user_2.jpg"
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.heroCarouselContainer}>
      {images.map((img, index) => (
        <Image
          key={img}
          src={img}
          alt={`Premium Fashion ${index + 1}`}
          fill
          priority={index === 0}
          className={`${styles.heroCarouselImage} ${index === currentIndex ? styles.active : ''}`}
        />
      ))}
      <div className={styles.heroOverlay}></div>
    </div>
  );
}
