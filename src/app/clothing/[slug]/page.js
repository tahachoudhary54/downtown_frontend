import ProductGrid from "../../../components/ProductGrid";
import { fetchProducts } from "../../../lib/api";
import { categories } from "../../../data/categories";
import styles from "../../page.module.css";
import { notFound } from "next/navigation";

export default async function CollectionPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    notFound();
  }

  const products = await fetchProducts({ category: category.name });

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>{category.name}</h1>
          <div className={styles.sectionLine}></div>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <p>No products found in this collection.</p>
          </div>
        )}
      </section>
    </div>
  );
}
