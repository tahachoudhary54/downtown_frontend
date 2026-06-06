import Image from "next/image";
import Link from "next/link";
import { categories } from "../../data/categories";
import styles from "../page.module.css";

export default function ClothingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>ESSENTIAL COLLECTION CATEGORIES</h1>
          <div className={styles.sectionLine}></div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {categories.map((cat, index) => (
            <Link key={`${cat.id}-${index}`} href={`/clothing/${cat.slug}`} className={styles.editorialCard} style={{ minHeight: '400px', display: 'block', textDecoration: 'none' }}>
              <div className={styles.editorialImageWrapper} style={{ height: '320px' }}>
                <Image src={cat.img} alt={cat.name} fill className={styles.editorialImage} style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.editorialContent} style={{ padding: '1rem 0' }}>
                <h3 className={styles.editorialTitle} style={{ fontSize: '1.2rem', marginBottom: '0' }}>{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
