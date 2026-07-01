'use client';

import PageHero from '@/components/PageHero';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './shipping.module.css';

export const defaultShippingData = {
  heroTitle: "Shipping & Returns",
  heroSubtitle: "Everything you need to know about our delivery process and return policy.",
  timeline: [
    { title: "Order Processed", desc: "Orders are processed after successful payment confirmation.", iconPath: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" },
    { title: "Delivery Confirmation", desc: "Admin contacts you to confirm availability and delivery charge before dispatch.", iconPath: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" },
    { title: "Shipped via Porter", desc: "Porter is booked only after your approval of the delivery charge.", iconPath: "M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
    { title: "Delivered", desc: "Delivery time depends on confirmation, timing, and location.", iconPath: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" }
  ],
  cards: [
    {
      title: "Shipping Policy",
      items: [
        "**Delivery Area:** We currently deliver exclusively within India.",
        "**Order Processing:** Orders are processed only after payment confirmation.",
        "**Delivery Confirmation:** Before dispatch, our admin will contact you to communicate the Porter delivery charge.",
        "**Approval Required:** You must approve the delivery charge. Porter is booked only after your approval.",
        "**Delivery Charges:** Porter delivery charges are not included in product prices. Customers pay the delivery charge directly to the Porter delivery partner at the time of delivery.",
        "**Cancellations:** If you reject the delivery charge before dispatch, your order is cancelled, and the product payment is refunded within approximately 7 business days.",
        "**Delivery Time:** Delivery timing depends on your confirmation, order timing, and location."
      ]
    },
    {
      title: "Returns & Exchanges",
      items: [
        "**Returns:** Accepted only for damaged, defective, or incorrectly delivered products. Requests must be submitted within 48 hours of delivery.",
        "**Exchanges:** Requests must be submitted within 48 hours of delivery. Products must be unused and in original condition.",
        "**Condition:** Product must be unused, unworn, unwashed, and have all original tags attached.",
        "**Charges:** Customers are always responsible for paying return shipping charges.",
        "**Inspection:** Returned products are inspected before refunds or exchanges are approved."
      ]
    },
    {
      title: "Refund Policy",
      paragraphs: [
        "If a customer rejects the Porter delivery charge before dispatch, the order is cancelled and the product payment is refunded.",
        "For returns, approved refunds are processed within approximately 7 business days after inspection.",
        "Refunds are credited to the original payment method used during checkout."
      ]
    }
  ]
};

// Helper to render bold text and HTML
const renderText = (text) => {
  const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return <span dangerouslySetInnerHTML={{ __html: htmlText }} />;
};

export default function ShippingContent() {
  const shippingData = defaultShippingData;
  const loading = false;

  return (
    <div className={styles.page}>
      <PageHero 
        title={shippingData?.heroTitle || "Shipping & Returns"} 
        subtitle={shippingData?.heroSubtitle || ""}
      />
      
      <div className={styles.container}>
        {loading ? (
          <div className="text-center py-10 opacity-50">Loading Shipping Information...</div>
        ) : (
          <>
            {/* Timeline Section */}
            <section className={styles.timelineSection}>
              <h2 className={styles.sectionTitle}>Delivery Timeline</h2>
              <div className={styles.timeline}>
                {shippingData.timeline?.map((item, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {item.iconPath.split('M').map((pathPart, idx) => {
                          if (!pathPart) return null;
                          return <path key={idx} d={`M${pathPart}`} />;
                        })}
                      </svg>
                    </div>
                    <div className={styles.timelineContent}>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cards Section */}
            <div className={styles.infoCards}>
              {shippingData.cards?.map((card, i) => (
                <div key={i} className={styles.infoCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{card.title}</h3>
                  </div>
                  <div className={styles.cardBody}>
                    {card.items && (
                      <ul>
                        {card.items.map((item, j) => (
                          <li key={j}>{renderText(item)}</li>
                        ))}
                      </ul>
                    )}
                    {card.paragraphs && card.paragraphs.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                    {card.note && <p className={styles.cardNote}>{card.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
