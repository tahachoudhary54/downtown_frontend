"use client";
import Image from 'next/image';
import Link from 'next/link';
import styles from '../app/page.module.css';
import { useWishlist } from '../context/WishlistContext';
import IconHeartOutline from './IconHeartOutline';
import IconHeartFilled from './IconHeartFilled';

export default function ProductGrid({ products }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  return (
    <section className={styles.productGrid}>
      {products.map((item) => (
        <Link href={`/product/${item._id || item.id}`} key={item._id || item.id} style={{ textDecoration: 'none' }}>
          <div className={styles.productCard}>
            <div className={styles.productImageWrapper}>
              <Image src={item.img} alt={item.name} fill className={styles.productImage} />
              <div className={styles.productOverlay}>
                <span className={styles.viewDetailsText}>VIEW DETAILS &rarr;</span>
{/* Heart button toggles wishlist state */}
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
                className={styles.btnCardAdd} 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Handle Add to Cart */ }}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
