import { staticSeo } from "../seoConfig";

export async function generateMetadata() {
  const meta = staticSeo["/about"];
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: [{ url: meta.ogImage }],
    },
    twitter: {
      card: meta.twitterCard,
      title: meta.title,
      description: meta.description,
      images: [{ url: meta.ogImage }],
    },
  };
}


export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>ABOUT US</h1>
          <div className={styles.sectionLine}></div>
        </div>
        <div style={{ padding: '2rem 0', lineHeight: '1.8', color: 'rgba(46,42,39,0.8)' }}>
          <p style={{ marginBottom: '1.5rem' }}>Welcome to Downtown Boutique. We believe in elevating everyday fashion with premium materials and sophisticated designs tailored for the modern individual.</p>
          <p>Founded with a passion for uncompromising craftsmanship, every garment is meticulously crafted using only the finest materials. Our dedication to timeless design ensures each piece remains a staple in your wardrobe for years to come.</p>
        </div>
      </section>
    </div>
  );
}
