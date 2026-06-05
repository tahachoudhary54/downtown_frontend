import Image from "next/image";
import ProductGrid from "../components/ProductGrid";
import HeroSlider from "../components/HeroSlider";
import EssentialsSlider from "../components/EssentialsSlider";
import { products } from "../data/products";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>


      {/* Hero Section */}
      <HeroSlider />

      {/* Shop by Category - 5 Columns Editorial */}
      <EssentialsSlider />

      {/* Autumn Collection Banner */}
      <section className={styles.autumnBanner}>
        <div className={styles.autumnContent}>
          <h2 className={styles.autumnTitle}>Autumn Collection –<br/>Up to 30% OFF</h2>
          <button className={styles.btnBrown}>SHOP COLLECTION</button>
        </div>
        <div className={styles.autumnImageWrapper}>
          <Image src="/autumn_banner.png" alt="Autumn Collection" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
        </div>
      </section>

      {/* Trending Now */}
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>TRENDING NOW</h2>
          <div className={styles.sectionLine}></div>
        </div>
        <ProductGrid products={products.slice(0, 5)} />
      </section>
      
      {/* Why Choose Us Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>Why Choose Us</h2>
        <div className={styles.featuresGrid}>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <h3>Premium Quality</h3>
            <p>Meticulously crafted from the finest materials for unparalleled comfort and durability.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h3>Free Shipping</h3>
            <p>Enjoy complimentary shipping and hassle-free returns on all global orders.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3>Secure Payments</h3>
            <p>Your transactions are protected by industry-leading encryption and security.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <h3>24/7 Support</h3>
            <p>Our dedicated customer service team is available around the clock to assist you.</p>
          </div>

        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <h2 className={styles.newsletterTitle}>JOIN THE EXCLUSIVE LIST</h2>
        <p className={styles.newsletterDesc}>Subscribe to receive updates on new arrivals, special offers and our promotions.</p>
        <form className={styles.newsletterForm}>
          <input type="email" placeholder="Enter your email address" />
          <button type="submit" className={styles.btnPrimary}>SUBSCRIBE</button>
        </form>
      </section>


    </div>
  );
}
