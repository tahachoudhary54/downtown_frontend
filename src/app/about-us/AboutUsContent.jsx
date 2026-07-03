'use client';

import PageHero from '@/components/PageHero';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './about.module.css';

export const defaultAboutData = {
  heroTitle: "Our Story",
  heroSubtitle: "Redefining modern menswear with timeless elegance and uncompromising quality.",
  sections: [
    {
      title: "The Heritage",
      paragraphs: [
        "Founded with a vision to bring unparalleled luxury to the modern gentleman, Downtown Boutique has established itself as the premier destination for discerning individuals. We believe that true style is a reflection of character, and our collections are curated to enhance the unique presence of every client.",
        "From our humble beginnings to our current flagship presence, our dedication to excellence has remained unwavering. Every garment we select represents the pinnacle of design and sartorial mastery."
      ],
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4l5 5L8 21l-5-1 1-5z"/><path d="M15 4l5 5"/></svg>,
      iconText: "Heritage & Tradition"
    },
    {
      title: "Uncompromising Quality",
      paragraphs: [
        "Our commitment to quality begins long before a garment reaches our shelves. We partner exclusively with artisans and ateliers who share our passion for perfection. Each piece is crafted using the finest materials sourced from historic mills around the globe.",
        "We pay meticulous attention to the smallest details—from the strength of the stitching to the precision of the cut—ensuring that your investment stands the test of time both in durability and style."
      ],
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
      iconText: "Masterful Craftsmanship"
    }
  ],
  stats: [
    { number: "10k+", label: "Happy Customers" },
    { number: "500+", label: "Premium Products" },
    { number: "24/7", label: "Dedicated Support" },
    { number: "100%", label: "Secure Payments" }
  ]
};

export default function AboutUsContent() {
  const { data: aboutData, loading } = usePolicy('aboutUs', defaultAboutData);

  return (
    <div className={styles.page}>
      <PageHero 
        title={aboutData?.heroTitle || "Our Story"} 
        subtitle={aboutData?.heroSubtitle || ""}
      />
      
      <div className={styles.container}>
        {loading ? (
          <div className="text-center py-10 opacity-50">Loading About Us...</div>
        ) : (
          <>
            {/* Story Section */}
            {aboutData.sections && aboutData.sections[0] && (
              <section className={`${styles.section} ${styles.imageRight}`}>
                <div className={styles.content}>
                  <h2 className={styles.title}>{aboutData.sections[0].title}</h2>
                  {aboutData.sections[0].paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <div className={styles.imagePlaceholder}>
                  <div className={styles.imageInner}>
                    <span className={styles.imageIcon}>{aboutData.sections[0].icon}</span>
                    <span>{aboutData.sections[0].iconText}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Stats Section */}
            {aboutData.stats && (
              <section className={styles.statsSection}>
                {aboutData.stats.map((stat, i) => (
                  <div key={i} className={styles.stat}>
                    <span className={styles.statNumber}>{stat.number}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Craftsmanship Section */}
            {aboutData.sections && aboutData.sections[1] && (
              <section className={`${styles.section} ${styles.imageLeft}`}>
                <div className={styles.imagePlaceholder}>
                  <div className={styles.imageInner}>
                    <span className={styles.imageIcon}>{aboutData.sections[1].icon}</span>
                    <span>{aboutData.sections[1].iconText}</span>
                  </div>
                </div>
                <div className={styles.content}>
                  <h2 className={styles.title}>{aboutData.sections[1].title}</h2>
                  {aboutData.sections[1].paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
