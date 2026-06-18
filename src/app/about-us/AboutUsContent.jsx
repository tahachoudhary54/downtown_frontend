'use client';

import PageHero from '@/components/PageHero';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './about.module.css';

const defaultAboutData = {
  heroTitle: "Our Story",
  heroSubtitle: "Redefining modern menswear with timeless elegance and uncompromising quality.",
  sections: [
    {
      title: "The Heritage",
      paragraphs: [
        "Founded with a vision to bring unparalleled luxury to the modern gentleman, Downtown Boutique has established itself as the premier destination for discerning individuals. We believe that true style is a reflection of character, and our collections are curated to enhance the unique presence of every client.",
        "From our humble beginnings to our current flagship presence, our dedication to excellence has remained unwavering. Every garment we select represents the pinnacle of design and sartorial mastery."
      ],
      icon: "✨",
      iconText: "Heritage & Tradition"
    },
    {
      title: "Uncompromising Quality",
      paragraphs: [
        "Our commitment to quality begins long before a garment reaches our shelves. We partner exclusively with artisans and ateliers who share our passion for perfection. Each piece is crafted using the finest materials sourced from historic mills around the globe.",
        "We pay meticulous attention to the smallest details—from the strength of the stitching to the precision of the cut—ensuring that your investment stands the test of time both in durability and style."
      ],
      icon: "✂️",
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
