import Image from "next/image";
import Link from "next/link";
import ProductGrid from "../components/ProductGrid";
import HeroSlider from "../components/HeroSlider";
import EssentialsSlider from "../components/EssentialsSlider";
import LuxurySaleBanner from "../components/LuxurySaleBanner";
import { fetchProducts } from "../lib/api";
import styles from "./page.module.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: "Downtown Boutique | Premium Fashion",
  description: "Discover the new standard of modern luxury menswear. Explore our exclusive collections today.",
};

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings?_t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (err) {
    console.error("Failed to fetch settings", err);
  }
  return null;
}


export default async function Home() {
  const settings = await getSettings();
  
  let products = [];
  try {
    products = await fetchProducts();
  } catch (err) {
    console.error("Failed to fetch products", err);
  }

  const heroSettings = settings?.hero || {
    slides: ["/hero_bg.png", "/hero_bg_v4.png", "/hero_bg_v6.png"],
    title: "ELEVATE YOUR\nEVERYDAY",
    subtitle: "Discover the new standard of modern luxury menswear. Designed for the discerning individual.",
    buttonText: "Shop Collection",
    buttonLink: "/shop"
  };

  const seasonalSettings = settings?.seasonalBanner || {
    enabled: true,
    title: "Autumn Collection –\nUp to 50% OFF",
    image: "/autumn_banner.png",
    buttonText: "SHOP SALE",
    buttonLink: "/sale"
  };

  return (
    <div className={styles.page}>


      {/* Hero Section */}
      <HeroSlider initialSettings={settings} />

      {/* Shop by Category - 5 Columns Editorial */}
      <EssentialsSlider initialSettings={settings} />

      {/* Luxury Sale Banner */}
      <LuxurySaleBanner initialSettings={settings} />

      {/* Trending Now */}
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>TRENDING NOW</h2>
          <div className={styles.sectionLine}></div>
        </div>
        <ProductGrid products={products.filter(p => !p.isOnSale).slice(0, 8)} />
      </section>
      
      {/* Why Choose Us Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeaderCol}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--foreground)' }}></div>
            <h2 className={styles.featuresSectionTitle} style={{ paddingRight: 0, margin: 0 }}>WHY CHOOSE US</h2>
            <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--foreground)' }}></div>
          </div>
        </div>
        <div className={styles.featuresGrid}>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <h3>Premium<br/>Quality</h3>
            <p>Meticulously crafted from the finest materials for unparalleled comfort and durability.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h3>Free<br/>Shipping</h3>
            <p>Enjoy complimentary shipping and hassle-free returns on all global orders.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3>Secure<br/>Payments</h3>
            <p>Your transactions are protected by industry-leading encryption and security.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <h3>24/7<br/>Support</h3>
            <p>Our dedicated customer service team is available around the clock to assist you.</p>
          </div>

        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.ourStorySection}>
        <div className={styles.ourStoryContainer}>
          <div className={styles.ourStoryContent}>
            <h2 className={styles.ourStoryTitle}>Our Story</h2>
            <p className={styles.ourStoryText}>
              At Downtown Boutique, we believe that great style begins with timeless essentials. Our collections are thoughtfully curated to combine premium quality, modern comfort, and effortless sophistication. Every piece is selected with attention to detail, ensuring versatility, durability, and confidence in every wear.
            </p>
            <Link href="/clothing" className={styles.btnExplore}>
              Explore Collection
            </Link>
          </div>
          <div className={styles.ourStoryImageWrapper}>
            <Image 
              src="/our_story_lifestyle.png" 
              alt="Downtown Boutique Lifestyle" 
              fill 
              className={styles.ourStoryImage} 
            />
          </div>
        </div>
      </section>


    </div>
  );
}
