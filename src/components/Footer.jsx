import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className={styles.footer}>
        <div>
          <div className={styles.logo} style={{ alignItems: 'flex-start', marginTop: '-10px' }}>
            <Link href="/">
              <Image src="/logo-horizontal-v2.png" alt="Downtown Boutique" width={160} height={40} style={{ objectFit: 'contain', filter: 'invert(1) brightness(0.2)' }} />
            </Link>
          </div>
          <p>Elevating everyday fashion with premium materials and sophisticated designs tailored for the modern individual.</p>
          <div className={styles.socialIcons}>
            <a href="https://www.instagram.com/downtown_boutique_kurla/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link href="/clothing">Men's Collection</Link></li>
            <li><Link href="/shop">New Arrivals</Link></li>
            <li><Link href="/sale">Best Sellers</Link></li>
          </ul>
        </div>
        <div>
          <h4>Information</h4>
          <ul>
            <li><Link href="/about-us">About Us</Link></li>
            <li><Link href="/contact-us">Contact Us</Link></li>
            <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4>Customer Service</h4>
          <ul>
            <li><Link href="/shipping-and-returns">Shipping & Returns</Link></li>
            <li><Link href="/size-guide">Size Guide</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
      </footer>
      <div className={styles.copyright}>
        &copy; {new Date().getFullYear()} Downtown Boutique. All Rights Reserved.
      </div>
      
    </>
  );
}
