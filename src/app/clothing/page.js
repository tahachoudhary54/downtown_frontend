import Image from "next/image";
import Link from "next/link";
import { categories as defaultCategories } from "../../data/categories";
import styles from "../page.module.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Clothing Categories | Downtown Boutique',
  description: 'Browse our collection of premium clothing.',
};

async function fetchCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings?_t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && data.data?.categories) {
      return data.data.categories.filter(c => c.isActive !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
  } catch (err) {
    console.error("Failed to fetch settings categories", err);
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
          {activeCategories.map((cat, index) => {
            const defaultCat = defaultCategories.find(c => c.slug === cat.slug);
            const imgSrc = cat.img || defaultCat?.img || '/placeholder.png';
            return (
            <Link key={`${cat.id || cat._id || index}`} href={`/clothing/${cat.slug}`} className={styles.editorialCard} style={{ textDecoration: 'none' }}>
              <div className={styles.editorialImageWrapper}>
                <Image src={imgSrc} alt={cat.name} fill className={styles.editorialImage} style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.editorialContent}>
                <h3 className={styles.editorialTitle}>{cat.name}</h3>
              </div>
            </Link>
          )})}
        </div>
      </section>
    </div>
  );
}
