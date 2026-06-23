'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import AddToCartSection from "./AddToCartSection";
import styles from "./product.module.css";
import { getSalePricing } from "../../../utils/price";

import { useLiveVariants } from "../../../context/RealtimeStockContext";
import ReviewsSection from "./ReviewsSection";

export default function ProductDisplayClient({ product }) {
  const { isSaleValid, originalPriceStr, salePriceStr } = getSalePricing(product);
  
  const liveVariants = useLiveVariants(product._id || product.id, product.variants || []);
  const variants = liveVariants;
  
  // Default to the first available variant color to ensure its name/image shows immediately
  const initialColor = product.variants && product.variants.length > 0 ? product.variants[0].colorName : "";
  const [selectedColor, setSelectedColor] = useState(initialColor);
  
  const [mainImage, setMainImage] = useState(product.img);
  const [displayImages, setDisplayImages] = useState([product.img].filter(Boolean));

  // Sync main image when color changes
  useEffect(() => {
    if (!selectedColor) return;
    const newVariant = variants.find(v => v.colorName === selectedColor);
    if (newVariant?.images?.length > 0) {
      setMainImage(newVariant.images[0]);
      setDisplayImages(newVariant.images);
    } else {
      setMainImage(product.img);
      setDisplayImages([product.img].filter(Boolean));
    }
  }, [selectedColor, variants, product.img]);

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.img],
    "description": product.description || "Premium fashion product from Downtown Boutique.",
    "sku": product.sku || product._id,
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/product/${product._id}`,
      "priceCurrency": "INR",
      "price": isSaleValid ? product.originalPrice - (product.originalPrice * 0.1) /* Or just pass the actual numerical values if we had them. Just extracting roughly */ : product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  if (product.reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.reviewCount
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              {mainImage && <Image src={mainImage} alt={product.name} fill className={styles.productImage} priority />}
            </div>
            {displayImages.length > 1 && (
              <div className={styles.thumbnailGallery} style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                {displayImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    style={{ 
                      position: 'relative', width: '80px', height: '80px', cursor: 'pointer',
                      border: mainImage === img ? '2px solid var(--accent)' : '1px solid var(--border)',
                      borderRadius: '8px', overflow: 'hidden'
                    }}
                  >
                    <Image src={img} alt={`${product.name} view ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.detailsCol}>
            <p className={styles.brand}>DOWNTOWN EXCLUSIVE</p>
            <h1 className={styles.title}>
              {selectedColor && variants.find(v => v.colorName === selectedColor)?.variantName 
                ? variants.find(v => v.colorName === selectedColor).variantName 
                : product.name}
            </h1>
            {isSaleValid ? (
              <div className="premiumPriceContainer" style={{ marginBottom: '2rem' }}>
                <span className="premiumOriginalPrice" style={{ fontSize: '1.2rem' }}>{originalPriceStr}</span>
                <span className={styles.price} style={{ marginBottom: 0 }}>{salePriceStr}</span>
              </div>
            ) : (
              <p className={styles.price}>{salePriceStr}</p>
            )}
            
            <p className={styles.description}>
              {product.description}
            </p>

            <AddToCartSection 
              product={product} 
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
            
            <div className={styles.features}>
              <p>✓ Free Standard Shipping on orders above ₹999</p>
              <p>✓ 30-Day Easy Returns</p>
              <p>✓ 100% Secure Checkout</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection product={product} />

      </main>
    </>
  );
}
