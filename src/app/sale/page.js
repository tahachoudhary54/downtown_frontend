import ProductGrid from "../../components/ProductGrid";
import { fetchProducts } from "../../lib/api";
import styles from "../page.module.css";

export default async function SalePage() {
  const products = await fetchProducts({ sale: "true" });

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>SALE</h1>
          <div className={styles.sectionLine}></div>
        </div>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <p>No sale items available right now. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
