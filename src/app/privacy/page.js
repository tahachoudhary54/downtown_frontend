import styles from "../page.module.css";
import { staticSeo } from "../seoConfig";

export async function generateMetadata() {
  const meta = staticSeo["/privacy"];
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

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>PRIVACY POLICY</h1>
          <div className={styles.sectionLine}></div>
        </div>
        <div style={{ padding: '2rem 0', lineHeight: '1.8', color: 'rgba(46,42,39,0.8)' }}>
          <p>We take your privacy seriously. This policy describes what personal information we collect and how we use it.</p>
        </div>
      </section>
    </div>
  );
}
