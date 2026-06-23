import LiveProductGrid from "../../components/LiveProductGrid";
import { fetchProducts } from "../../lib/api";
import styles from "../page.module.css";
import { Suspense } from 'react';

export default async function SalePage() {
  const products = await fetchProducts({ sale: "true" });

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>SALE</h1>
          <div className={styles.sectionLine}></div>
        </div>
        <Suspense fallback={<div style={{padding: '40px', textAlign: 'center'}}>Loading products...</div>}>
          <LiveProductGrid 
            initialProducts={products} 
            queryParams={{ sale: "true" }}
            emptyMessage="No sale items available right now. Check back soon!" 
          />
        </Suspense>
      </section>
    </div>
  );
}
