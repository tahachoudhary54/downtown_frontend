import ProductGrid from "../../components/ProductGrid";
import { fetchProducts } from "../../lib/api";
import styles from "../page.module.css";

export default async function ClothingPage() {
  const products = await fetchProducts({ category: "clothing" });

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>CLOTHING</h1>
          <div className={styles.sectionLine}></div>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
