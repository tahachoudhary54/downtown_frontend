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
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
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
            <li><Link href="/shop">Men's Collection</Link></li>
            <li><Link href="/shop">New Arrivals</Link></li>
            <li><Link href="/shop">Best Sellers</Link></li>
          </ul>
        </div>
        <div>
          <h4>Information</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/terms">Terms & Conditions</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4>Customer Service</h4>
          <ul>
            <li><Link href="/contact">Shipping & Returns</Link></li>
            <li><Link href="/contact">Track Order</Link></li>
            <li><Link href="/contact">Size Guide</Link></li>
            <li><Link href="/contact">FAQ</Link></li>
          </ul>
        </div>
      </footer>
      <div className={styles.copyright}>
        &copy; {new Date().getFullYear()} Downtown Boutique. All Rights Reserved.
      </div>
      
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/919867211505" 
        className={styles.whatsappFloat}
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
          <path d="M12.031 0C5.398 0 0 5.4 0 12.031c0 2.628.847 5.08 2.316 7.112l-1.554 5.674 5.815-1.526A11.972 11.972 0 0012.031 24c6.632 0 12.031-5.399 12.031-12.031S18.663 0 12.031 0zm6.544 17.33c-.276.78-1.597 1.488-2.203 1.542-.562.05-1.288.196-4.103-1.002-3.567-1.517-5.836-5.143-6.012-5.378-.176-.235-1.436-1.913-1.436-3.649 0-1.737.91-2.585 1.233-2.922.321-.337.7-.421.935-.421.235 0 .47.001.675.011.213.01.498-.083.778.591.293.704.996 2.428 1.084 2.604.088.176.147.382.029.617-.118.235-.176.381-.352.587-.176.205-.371.442-.528.587-.176.162-.364.337-.164.689.199.352.887 1.474 1.91 2.385 1.315 1.171 2.41 1.534 2.763 1.696.352.162.558.147.763-.088.205-.235.887-1.026 1.122-1.378.235-.352.47-.293.793-.176.323.118 2.052.968 2.404 1.144.352.176.587.264.675.411.088.147.088.851-.188 1.631z"/>
        </svg>
      </a>
    </>
  );
}
