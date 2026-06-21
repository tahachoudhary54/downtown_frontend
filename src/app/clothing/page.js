import Image from "next/image";
import Link from "next/link";
import { categories as defaultCategories } from "../../data/categories";
import styles from "../page.module.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories?activeOnly=true`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (err) {
    console.error("Failed to fetch categories", err);
  }
  return [];
}

export default async function ClothingPage() {
  const activeCategories = await fetchCategories();
  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>ESSENTIAL COLLECTION CATEGORIES</h1>
          <div className={styles.sectionLine}></div>
        </div>
        
        <div className={styles.clothingGrid}>
          {activeCategories.map((cat, index) => (
            <Link key={`${cat.id}-${index}`} href={`/clothing/${cat.slug}`} className={styles.editorialCard} style={{ textDecoration: 'none' }}>
              <div className={styles.editorialImageWrapper}>
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
