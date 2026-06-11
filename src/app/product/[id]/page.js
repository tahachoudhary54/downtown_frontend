import Image from "next/image";
import Link from "next/link";
import { fetchProductById } from "../../../lib/api";
import AddToCartSection from "./AddToCartSection";
import styles from "./product.module.css";
import { getProductSeo } from "../../seoConfig";
import { getSalePricing } from "../../../utils/price";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const meta = await getProductSeo(params);
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
      card: meta.twitterCard || "summary",
      title: meta.title,
      description: meta.description,
      images: [{ url: meta.ogImage }],
    },
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const product = await fetchProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const { isSaleValid, originalPriceStr, salePriceStr } = getSalePricing(product);

  return (
    <div className={styles.page}>


      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              <Image src={product.img} alt={product.name} fill className={styles.productImage} priority />
            </div>
          </div>
          <div className={styles.detailsCol}>
            <p className={styles.brand}>DOWNTOWN EXCLUSIVE</p>
            <h1 className={styles.title}>{product.name}</h1>
            {isSaleValid ? (
              <div className="premiumPriceContainer" style={{ marginBottom: '2rem' }}>
                <span className="premiumOriginalPrice" style={{ fontSize: '1.2rem' }}>{originalPriceStr}</span>
                <span className={styles.price} style={{ marginBottom: 0 }}>{salePriceStr}</span>
              </div>
            ) : (
              <p className={styles.price}>{product.price}</p>
            )}
            
            <p className={styles.description}>
              {product.description}
            </p>

            <AddToCartSection product={product} />
            
            <div className={styles.features}>
              <p>✓ Free Standard Shipping on orders above ₹999</p>
              <p>✓ 30-Day Easy Returns</p>
              <p>✓ 100% Secure Checkout</p>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
