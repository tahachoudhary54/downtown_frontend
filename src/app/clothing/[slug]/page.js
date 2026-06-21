import LiveProductGrid from "../../../components/LiveProductGrid";
import { fetchProducts } from "../../../lib/api";
import { categories as defaultCategories } from "../../../data/categories";
import styles from "../../page.module.css";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (err) {
    console.error("Failed to fetch settings", err);
  }
  return null;
}

export default async function CollectionPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  const settings = await getSettings();
  const dynamicCategories = settings?.categories && Array.isArray(settings.categories) ? settings.categories : defaultCategories;
  
  const category = dynamicCategories.find((c) => c.slug === slug) || defaultCategories.find((c) => c.slug === slug);
  
  if (!category) {
    notFound();
  }

  const products = await fetchProducts({ category: category.name, limit: 1000 });

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>{category.name}</h1>
          <div className={styles.sectionLine}></div>
        </div>

        <LiveProductGrid 
          initialProducts={products} 
          queryParams={{ category: category.name, limit: 1000 }}
          emptyMessage="No products found in this collection." 
        />
      </section>
    </div>
  );
}
