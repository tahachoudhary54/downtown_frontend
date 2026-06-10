"use client";
import Image from 'next/image';
import Link from 'next/link';
import styles from '../app/page.module.css';
import { useWishlist } from '../context/WishlistContext';
import IconHeartOutline from './IconHeartOutline';
import IconHeartFilled from './IconHeartFilled';

import { useLiveStock } from '../context/RealtimeStockContext';

function ProductCard({ item }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const liveStock = useLiveStock(item._id || item.id, item.stock !== undefined ? item.stock : (item.totalStock || 0));

  let stockStatus = { text: '', className: '' };
  if (liveStock === 0) {
    stockStatus = { text: 'Out of Stock', className: styles.stockOut };
  } else if (liveStock >= 20) {
    stockStatus = { text: 'In Stock', className: styles.stockInStock };
  } else if (liveStock >= 6) {
    stockStatus = { text: `Only ${liveStock} left in stock`, className: styles.stockLow };
  } else {
    stockStatus = { text: `🔥 Hurry! Only ${liveStock} left`, className: styles.stockCritical };
  }

  return (
    <Link href={`/product/${item._id || item.id}`} style={{ textDecoration: 'none' }}>
      <div className={styles.productCard}>
        <div className={styles.productImageWrapper}>
          <Image src={item.img} alt={item.name} fill className={styles.productImage} />
          
          {/* Stock Indicator over Image */}
          {liveStock > 0 && (
            <div className={styles.stockOverlay}>
              <span className={`${styles.stockIndicatorImage} ${stockStatus.className}`}>
                {stockStatus.text}
              </span>
            </div>
          )}

          {liveStock === 0 && (
            <div className={styles.outOfStockOverlay}>
              <span className={styles.outOfStockBadge}>OUT OF STOCK</span>
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
          <p className={styles.productPrice}>{item.price}</p>
          <button 
            className={`${styles.btnCardAdd} ${liveStock === 0 ? styles.btnCardAddDisabled : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Handle Add to Cart */ }}
            disabled={liveStock === 0}
          >
            {liveStock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
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
