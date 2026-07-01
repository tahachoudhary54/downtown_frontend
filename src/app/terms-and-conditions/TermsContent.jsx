'use client';

import PageHero from '@/components/PageHero';
import StickySidebarNav from '@/components/StickySidebarNav';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './policy.module.css';

export const defaultTermsData = {
  lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      paragraphs: ["These Terms & Conditions govern your use of our website, products, and services. By accessing or using the website, you agree to be bound by these terms. If you do not agree with any part of these terms, you may not use our services."]
    },
    {
      id: "use-of-site",
      title: "2. Use of Website",
      paragraphs: ["By using our website, you agree to:"],
      listItems: [
        "Use the website only for lawful purposes.",
        "Provide accurate information while placing orders.",
        "Not misuse, copy, hack, or interfere with the website.",
        "Be at least 18 years old or use the website under parental or guardian supervision."
      ]
    },
    {
      id: "intellectual-property",
      title: "3. Intellectual Property",
      paragraphs: ["All content included on this website belongs to our business and cannot be copied or reused without written permission. This includes, but is not limited to:"],
      listItems: [
        "Logos and branding",
        "Images and product photographs",
        "Text and typography",
        "Graphics and design",
        "Source content"
      ]
    },
    {
      id: "products-pricing",
      title: "4. Products & Pricing",
      paragraphs: [
        "We make every effort to display product images and colours accurately. However, actual colours may vary slightly depending on your screen settings.",
        "Prices may change without prior notice, and all products are subject to availability.",
        "If an obvious pricing error occurs, we reserve the right to cancel the order and issue a full refund."
      ]
    },
    {
      id: "orders",
      title: "5. Orders & Acceptance",
      paragraphs: [
        "Product payment is collected online during checkout. However, Porter delivery charges are not included in the checkout price.",
        "After your order is placed, the delivery charge is communicated to you separately by our admin.",
        "You must approve the delivery charge. Porter booking occurs only after your approval.",
        "Orders may be cancelled if the delivery charge is rejected before dispatch. In such cases, refunds are processed according to our Refund Policy."
      ]
    },
    {
      id: "shipping-delivery",
      title: "6. Shipping & Delivery",
      paragraphs: [
        "Delivery is available only within India.",
        "Orders are delivered through our delivery partner, Porter.",
        "Porter delivery charges are paid separately by the customer directly to the Porter delivery partner at the time of delivery. Delivery charges are not included in product prices.",
        "Delivery times may vary depending on order time, customer location, weather conditions, traffic, holidays, and Porter availability."
      ]
    },
    {
      id: "returns-exchanges",
      title: "7. Returns, Exchanges & Refunds",
      paragraphs: [
        "Returns and exchanges are accepted only for damaged, defective, or incorrect products.",
        "Requests must be submitted within 48 hours of delivery.",
        "Products must be unused, unwashed, and have original tags attached.",
        "Customers are responsible for all Porter delivery charges related to returns and exchanges.",
        "Once approved, refunds are processed within approximately 7 business days to the original payment method."
      ]
    },
    {
      id: "payments",
      title: "8. Payments",
      paragraphs: [
        "Payments are processed securely online through Razorpay.",
        "Only UPI and Net Banking payment methods are supported. Cash on Delivery (COD) is not available.",
        "We do not store customer payment credentials on our servers."
      ]
    },
    {
      id: "limitation-liability",
      title: "9. Limitation of Liability",
      paragraphs: ["We are not responsible for:"],
      listItems: [
        "Delivery delays caused by Porter.",
        "Incorrect shipping information provided by the customer.",
        "Delays due to natural disasters, strikes, government restrictions, technical failures, or other events beyond our control."
      ]
    },
    {
      id: "changes-to-terms",
      title: "10. Changes to Terms",
      paragraphs: ["We reserve the right to update these Terms & Conditions at any time. Updated versions become effective immediately after publication on the website."]
    },
    {
      id: "contact",
      title: "11. Contact Information",
      paragraphs: ["If you have any questions regarding these Terms & Conditions, please reach out to us via our Contact Us page or through our WhatsApp support channel."]
    }
  ]
};

export default function TermsContent() {
  const { data: termsData, loading } = usePolicy('termsAndConditions', defaultTermsData);

  // If it's a raw string (e.g. admin wrote plain text), just render it pre-wrapped
  if (typeof termsData === 'string') {
    return (
      <div className={styles.page}>
        <PageHero title="Terms & Conditions" subtitle="Please read these terms carefully before using our services." />
        <div className={styles.container}>
          <div className={styles.policyCard} style={{ whiteSpace: 'pre-wrap' }}>
            {termsData}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, it's structured JSON
  const sectionsForNav = termsData?.sections?.map(s => ({ id: s.id, title: s.title })) || [];

  return (
    <div className={styles.page}>
      <PageHero 
        title="Terms & Conditions" 
        subtitle="Please read these terms carefully before using our services."
      />
      
      <div className={styles.container}>
        {loading ? (
          <div className="text-center py-10 opacity-50">Loading Terms & Conditions...</div>
        ) : (
          <div className={styles.layout}>
            {sectionsForNav.length > 0 && (
              <aside className={styles.sidebarCol}>
                <StickySidebarNav sections={sectionsForNav} />
              </aside>
            )}
            
            <main className={styles.contentCol}>
              <div className={styles.policyCard}>
                {termsData?.lastUpdated && (
                  <p className={styles.lastUpdated}>Last Updated: {termsData.lastUpdated}</p>
                )}

                {termsData?.sections?.map((section, idx) => (
                  <section key={idx} id={section.id} className={styles.policySection}>
                    <h2>{section.title}</h2>
                    {section.paragraphs?.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {section.listItems && section.listItems.length > 0 && (
                      <ul>
                        {section.listItems.map((li, i) => (
                          <li key={i}>{li}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
