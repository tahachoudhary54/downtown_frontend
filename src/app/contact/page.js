import styles from "../page.module.css";

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>CONTACT US</h1>
          <div className={styles.sectionLine}></div>
        </div>
        <div style={{ padding: '2rem 0', lineHeight: '1.8', color: 'rgba(46,42,39,0.8)' }}>
          <p style={{ marginBottom: '1.5rem' }}>We'd love to hear from you. For any inquiries, please contact our support team.</p>
          <p><strong>Email:</strong> support@downtownboutique.com</p>
          <p><strong>Phone:</strong> +91 9867211505</p>
        </div>
      </section>
    </div>
  );
}
