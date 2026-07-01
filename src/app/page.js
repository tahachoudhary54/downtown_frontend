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
    slides: ["/hero_slide_1.jpg", "/hero_slide_2.jpg", "/hero_slide_3.jpg"],
    title: "Everyday Style. Premium Comfort.",
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h3>Fast<br/>Delivery</h3>
            <p>Quick dispatch through our delivery partner.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h3>Easy<br/>Returns</h3>
            <p>Simple return and exchange request process.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3>Secure<br/>Payments</h3>
            <p>Your online payments are protected using trusted payment gateways.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Customer<br/>Support</h3>
            <p>Our support team is here to help with your orders and inquiries.</p>
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
