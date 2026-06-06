import LiveProductGrid from "../../components/LiveProductGrid";
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

        <LiveProductGrid 
          initialProducts={products} 
          queryParams={query ? { search: query } : {}}
          emptyMessage="No products found matching your search." 
        />
      </section>
    </div>
  );
}
