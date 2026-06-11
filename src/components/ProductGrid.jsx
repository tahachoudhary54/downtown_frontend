"use client";
import Image from 'next/image';
import Link from 'next/link';
import styles from '../app/page.module.css';
import { useWishlist } from '../context/WishlistContext';
import IconHeartOutline from './IconHeartOutline';
import IconHeartFilled from './IconHeartFilled';

import { useLiveStock } from '../context/RealtimeStockContext';
import { getSalePricing } from '../utils/price';

function ProductCard({ item }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const liveStock = useLiveStock(item._id || item.id, item.stock !== undefined ? item.stock : (item.totalStock || 0));
  const { isSaleValid, originalPriceStr, salePriceStr } = getSalePricing(item);

  let badgeText = null;
  let badgeClass = styles.statusBadge;

  if (liveStock > 0 && (item.isNew || (item.createdAt && (Date.now() - new Date(item.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000)))) {
    badgeText = 'New Arrival';
  }

  return (
    <Link href={`/product/${item._id || item.id}`} style={{ textDecoration: 'none' }}>
      <div className={styles.productCard}>
        <div className={styles.productImageWrapper}>
          <Image src={item.img} alt={item.name} fill className={`${styles.productImage} ${liveStock === 0 ? styles.premiumOutOfStockImage : ''}`} />
          
          {/* Status Badge over Image (New Arrival) */}
          {badgeText && (
            <div className={badgeClass}>
              {badgeText}
            </div>
          )}

          {/* Premium Sale Badge */}
          {isSaleValid && liveStock > 0 && (
            <div className="premiumSaleBadge">
              SALE
            </div>
          )}

          {/* Premium Out of Stock Badge */}
          {liveStock === 0 && (
            <div className={styles.premiumOutOfStockBadge}>
              Out of Stock
            </div>
          )}

          {/* Premium Low Stock Badge */}
          {liveStock > 0 && liveStock <= 20 && (
            <div className={styles.premiumLowStockBadge}>
              Only {liveStock} left
            </div>
          )}

          <div className={styles.productOverlay}>
            <span className={styles.viewDetailsText}>VIEW DETAILS &rarr;</span>
            <button
              className={`${styles.btnHeart} ${isWishlisted(item._id || item.id) ? styles.btnHeartActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(item);
              }}
            >
              {isWishlisted(item._id || item.id) ? <IconHeartFilled /> : <IconHeartOutline />}
            </button>
          </div>
        </div>
        <div className={styles.productInfo}>
          <h4 className={styles.productName}>{item.name}</h4>
          <p className={styles.productSubtitle}>Luxury Essentials Collection</p>
          <div className={styles.premiumSeparator}></div>
          {isSaleValid ? (
            <div className="premiumPriceContainer">
              <span className="premiumOriginalPrice">{originalPriceStr}</span>
              <span className="premiumSalePrice">{salePriceStr}</span>
            </div>
          ) : (
            <p className={styles.productPrice}>{item.price}</p>
          )}

          <button 
            className={`${styles.btnCardAdd} ${liveStock === 0 ? styles.btnCardAddDisabled : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Handle Add to Cart */ }}
            disabled={liveStock === 0}
          >
            {liveStock === 0 ? 'NOTIFY ME' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function ProductGrid({ products }) {
  return (
    <section className={styles.productGrid}>
      {products.map((item) => (
        <ProductCard key={item._id || item.id} item={item} />
      ))}
    </section>
  );
}
