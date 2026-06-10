import styles from "../page.module.css";

export const metadata = {
  title: "Shipping & Returns – Downtown Boutique",
  description: "Learn about our shipping policies, delivery timelines, and hassle-free return process at Downtown Boutique.",
  keywords: "shipping, returns, delivery, refund policy, downtown boutique",
};

export default function ShippingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>SHIPPING & RETURNS</h1>
          <div className={styles.sectionLine}></div>
        </div>

        <div style={{ padding: '2rem 0', lineHeight: '1.8', color: 'rgba(46,42,39,0.8)' }}>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2E2A27', marginBottom: '0.75rem', marginTop: '2rem' }}>Shipping Policy</h2>
          <p style={{ marginBottom: '1rem' }}>
            We offer <strong>free standard shipping</strong> on all orders above ₹999. Orders below ₹999 are charged a flat shipping fee of ₹99.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Standard Delivery:</strong> 5–7 business days</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Express Delivery:</strong> 2–3 business days (charges apply)</li>
            <li style={{ marginBottom: '0.5rem' }}>Orders are processed within 1–2 business days after confirmation.</li>
            <li style={{ marginBottom: '0.5rem' }}>You will receive a tracking number via email once your order is shipped.</li>
          </ul>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2E2A27', marginBottom: '0.75rem', marginTop: '2rem' }}>Return Policy</h2>
          <p style={{ marginBottom: '1rem' }}>
            We offer a <strong>30-day return window</strong> from the date of delivery. Items must be unused, unwashed, and in their original condition with all tags attached.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>To initiate a return, contact us at <strong>support@downtownboutique.com</strong></li>
            <li style={{ marginBottom: '0.5rem' }}>Once your return is received and inspected, a refund will be processed within 5–7 business days.</li>
            <li style={{ marginBottom: '0.5rem' }}>Refunds are issued to the original payment method.</li>
            <li style={{ marginBottom: '0.5rem' }}>Sale items and discounted products are not eligible for returns.</li>
          </ul>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2E2A27', marginBottom: '0.75rem', marginTop: '2rem' }}>Exchange Policy</h2>
          <p>
            We currently offer exchanges for size or colour variants of the same product, subject to availability. Please reach out to our support team within 30 days of delivery to arrange an exchange.
          </p>
          <p style={{ marginTop: '1rem' }}>
            <strong>Contact:</strong> support@downtownboutique.com &nbsp;|&nbsp; <strong>Phone:</strong> +91 9867211505
          </p>
        </div>
      </section>
    </div>
  );
}
