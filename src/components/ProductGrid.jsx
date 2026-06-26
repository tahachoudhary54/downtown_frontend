"use client";
import Image from 'next/image';
import Link from 'next/link';
import styles from '../app/page.module.css';
import { useWishlist } from '../context/WishlistContext';
import IconHeartOutline from './IconHeartOutline';
import IconHeartFilled from './IconHeartFilled';

import { useLiveStock, useLiveVisibility, useLiveDeleted, useLivePrice, useLiveSalePrice } from '../context/RealtimeStockContext';
import { getSalePricing } from '../utils/price';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';

function ProductCard({ item, showBadges = false }) {
  const isDeleted = useLiveDeleted(item._id || item.id);
  if (isDeleted) return null;
  const { toggleWishlist, isWishlisted } = useWishlist();
  
const { cart } = useCart();
  const quantityInCart = cart.reduce((total, cartItem) => {
    if ((cartItem.product._id || cartItem.product.id) === (item._id || item.id)) {
      return total + cartItem.quantity;
    }
    return total;
  }, 0);
  let initialStock = item.stock !== undefined ? item.stock : (item.totalStock || 0);
  if (item.variants && item.variants.length > 0) {
    initialStock = item.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  }
  const liveStock = useLiveStock(item._id || item.id, initialStock);
  const liveVisibility = useLiveVisibility(item._id || item.id, item.inStock !== undefined ? item.inStock : true);
  const livePrice = useLivePrice(item._id || item.id, item.price);
const liveSalePrice = useLiveSalePrice(item._id || item.id, item.salePrice);
const { isSaleValid, originalPriceStr, salePriceStr } = getSalePricing({ ...item, price: livePrice, salePrice: liveSalePrice });

  // If inStock is explicitly set to false, treat it as out of stock (0 stock) instead of hiding it completely.
  const effectiveLiveStock = liveVisibility === false ? 0 : liveStock;

  // Badge rendering – only when showBadges is true
  let badgeText = null;
  let badgeClass = styles.statusBadge;

  if (showBadges) {
    if (effectiveLiveStock > 0 && (item.isNew || (item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000))) {
      badgeText = 'New Arrival';
    }
  }

  return (
    <Link href={`/product/${item._id || item.id}`} style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
      <div className={styles.productCard} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}>
        
        {/* Quantity in Cart Badge */}
        {quantityInCart > 0 && (
          <div className={styles.cartQuantityBadge}>
            {quantityInCart}
          </div>
        )}

        <div className={styles.productImageWrapper} style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <Image src={item.img} alt={item.name} fill className={`${styles.productImage} ${effectiveLiveStock === 0 ? styles.premiumOutOfStockImage : ''}`} />
          
          {/* Status Badge over Image (New Arrival) */}
          {showBadges && badgeText && (
            <div className={badgeClass}>
              {badgeText}
            </div>
          )}

          {/* Premium Sale Badge */}
          {showBadges && isSaleValid && effectiveLiveStock > 0 && (
            <div className="premiumSaleBadge">
              SALE
            </div>
          )}

          {/* Premium Out of Stock Badge */}
          {showBadges && effectiveLiveStock === 0 && (
            <div className={styles.premiumOutOfStockBadge}>
              Out of Stock
            </div>
          )}

          {/* Premium Low Stock Badge */}
          {showBadges && effectiveLiveStock > 0 && effectiveLiveStock <= 20 && (
            <div className={styles.premiumLowStockBadge}>
              Only {effectiveLiveStock} left
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
        <div className={styles.productInfo} style={{ flexGrow: 1, justifyContent: 'space-between' }}>
          <div>
            <h4 className={styles.productName}>{item.name}</h4>
            <p className={styles.productSubtitle}>Luxury Essentials Collection</p>
            <div className={styles.premiumSeparator}></div>
          </div>
          {isSaleValid ? (
            <div className="premiumPriceContainer">
              <span className="premiumOriginalPrice">{originalPriceStr}</span>
              <span className="premiumSalePrice">{salePriceStr}</span>
            </div>
          ) : (
            <p className={styles.productPrice}>{salePriceStr}</p>
          )}

          <button 
            className={`${styles.btnCardAdd} ${effectiveLiveStock === 0 ? styles.btnCardAddDisabled : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Handle Add to Cart */ }}
            disabled={effectiveLiveStock === 0}
          >
            {effectiveLiveStock === 0 ? 'NOTIFY ME' : 'ADD TO CART'}
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
