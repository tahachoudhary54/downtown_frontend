'use client';

import Image from "next/image";
import Link from "next/link";
import { useSettings } from "../hooks/useSettings";
import styles from "../app/page.module.css";

export default function LiveSeasonalBanner({ initialSettings }) {
  const { settings } = useSettings(initialSettings);
  
  const seasonalSettings = settings?.seasonalBanner || {
    enabled: true,
    title: "Autumn Collection –\nUp to 50% OFF",
    image: "/autumn_banner.png",
    buttonText: "SHOP SALE",
    buttonLink: "/sale"
  };

  if (!seasonalSettings.enabled) return null;

  return (
    <section className={styles.autumnBanner}>
      <div className={styles.autumnContent}>
        <h2 className={styles.autumnTitle}>
          {seasonalSettings.title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <Link href={seasonalSettings.buttonLink} className={styles.btnBrown}>
          {seasonalSettings.buttonText}
        </Link>
      </div>
      <div className={styles.autumnImageWrapper}>
        <Image 
          src={seasonalSettings.image} 
          alt={seasonalSettings.title.replace('\n', ' ')} 
          fill 
          style={{ objectFit: 'cover', objectPosition: 'center' }} 
        />
      </div>
    </section>
  );
}
