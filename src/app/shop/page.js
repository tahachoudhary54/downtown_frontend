import ProductGrid from "../../components/ProductGrid";
import { fetchProducts } from "../../lib/api";
import styles from "../page.module.css";
import { staticSeo } from "../seoConfig";

export async function generateMetadata() {
  const meta = staticSeo["/shop"];
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

export default async function ShopPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.search || "";

  const products = await fetchProducts(query ? { search: query } : {});

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>
            {query ? `RESULTS FOR "${query.toUpperCase()}"` : "ALL COLLECTION"}
          </h1>
          <div className={styles.sectionLine}></div>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <p>No products found matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
}
