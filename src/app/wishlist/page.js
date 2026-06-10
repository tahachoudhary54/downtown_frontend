"use client";
import { useEffect } from 'react';
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import IconHeartOutline from "../../components/IconHeartOutline";
import IconHeartFilled from "../../components/IconHeartFilled";
import styles from "../page.module.css"; // using global styles

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectAfterAuth', '/wishlist');
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className={styles.page} style={{ paddingTop: '120px', background: '#FAFAFA' }}>
      <div className={styles.wishlistContainer}>
        <h2 className={styles.wishlistTitle} style={{ textAlign: 'left' }}>MY WISHLIST</h2>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <IconHeartOutline />
            <p style={{ marginTop: '1rem' }}>Your wishlist is currently empty.</p>
            <button
              style={{
                marginTop: '1rem',
                padding: '0.8rem 1.5rem',
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => (window.location.href = '/')}
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className={styles.wishlistGrid}>
            {wishlist.map((item) => (
              <div key={item._id || item.id} className={styles.wishlistCard} style={{ flex: '0 0 235px', maxWidth: '235px' }}>
                <div className={styles.wishlistImageWrapper}>
                  <img src={item.img} alt={item.name} className={styles.productImage} />
                  <div className={styles.wishlistOverlay}>
                    <span className={styles.viewDetailsText}>VIEW DETAILS &rarr;</span>
                  </div>
                  <button
                    className={`${styles.btnHeart} ${styles.btnHeartActive}`}
                    onClick={() => toggleWishlist(item)}
                  >
                    <IconHeartFilled />
                  </button>
                </div>
                <div className={styles.wishlistInfo}>
                  <h4 className={styles.wishlistName}>{item.name}</h4>
                  <p className={styles.wishlistSubtitle}>Luxury Essentials Collection</p>
                  <div className={styles.premiumSeparator}></div>
                  <p className={styles.wishlistPrice}>{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
