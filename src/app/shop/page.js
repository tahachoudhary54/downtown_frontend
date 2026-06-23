import LiveProductGrid from "../../components/LiveProductGrid";
import ShopFilters from "../../components/ShopFilters";
import { fetchProducts } from "../../lib/api";
import { categories as defaultCategories } from "../../data/categories";
import styles from "../page.module.css";
import { staticSeo } from "../seoConfig";
import { Suspense } from 'react';

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
  const category = resolvedSearchParams?.category || "";
  const sale = resolvedSearchParams?.sale || "";
  const minPrice = resolvedSearchParams?.minPrice || "";
  const maxPrice = resolvedSearchParams?.maxPrice || "";
  const page = resolvedSearchParams?.page || "1";

  const params = { limit: 50, page };
  if (query) params.search = query;
  if (category) params.category = category;
  if (sale) params.sale = sale;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  
  const res = await fetchProducts(params, true); 
  const products = res.products || [];
  const categoryCounts = res.categoryCounts || {};
  const pagination = res.pagination || null;
  
  const activeCategories = await fetchCategories();

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>
            {query ? `RESULTS FOR "${query.toUpperCase()}"` : "ALL COLLECTION"}
          </h1>
          <div className={styles.sectionLine}></div>
        </div>

        <div className={styles.shopLayout} style={{ flexDirection: 'column', gap: '0' }}>
          <Suspense fallback={<div style={{padding: '40px', textAlign: 'center'}}>Loading shop...</div>}>
            <aside style={{ width: '100%' }}>
              <ShopFilters categories={activeCategories.map(c => c.name)} categoryCounts={categoryCounts} />
            </aside>
            
            <div className={styles.shopGrid} style={{ width: '100%' }}>
              <LiveProductGrid 
                initialProducts={products} 
                initialPagination={pagination}
                queryParams={params}
                emptyMessage="No products found matching your search." 
              />
            </div>
          </Suspense>
        </div>
      </section>
    </div>
  );
}
