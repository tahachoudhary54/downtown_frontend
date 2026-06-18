'use client';

import PageHero from '@/components/PageHero';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './shipping.module.css';

const defaultShippingData = {
  heroTitle: "Shipping & Returns",
  heroSubtitle: "Enjoy a seamless luxury shopping experience from checkout to delivery.",
  timeline: [
    { title: "Order Placed", desc: "You'll receive a confirmation email instantly.", iconPath: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" },
    { title: "Packed", desc: "Carefully hand-packed within 24 hours.", iconPath: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" },
    { title: "Shipped", desc: "Dispatched with our premium logistics partners.", iconPath: "M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
    { title: "Delivered", desc: "Arrives safely at your doorstep.", iconPath: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" }
  ],
  cards: [
    {
      title: "Shipping Information",
      items: [
        "**Standard Delivery:** 3-5 business days. Complimentary on all orders over $200.",
        "**Express Delivery:** 1-2 business days. Available for a flat rate of $25.",
        "**International Delivery:** 5-10 business days depending on location. Duties may apply."
      ],
      note: "Please note that orders placed after 2 PM EST will be processed the following business day."
    },
    {
      title: "Returns Policy",
      items: [
        "Items must be returned within 30 days of delivery.",
        "All garments must remain unworn, unwashed, and with all original Downtown Boutique tags attached.",
        "Footwear must be returned in its original, undamaged shoebox.",
        "Customized, tailored, or final sale items cannot be returned."
      ],
      note: "A prepaid return shipping label is included with all domestic orders."
    },
    {
      title: "Refund Process",
      paragraphs: [
        "Once your return is received and inspected at our facility, we will send you an email to notify you of the approval or rejection of your refund.",
        "Approved refunds will be processed immediately, and a credit will automatically be applied to your original method of payment within 5-7 business days, depending on your financial institution."
      ]
    }
  ]
};

// Helper to render bold text
const renderText = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
};

export default function ShippingContent() {
  const { data: shippingData, loading } = usePolicy('shippingAndReturns', defaultShippingData);

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
