'use client';

import PageHero from '@/components/PageHero';
import StickySidebarNav from '@/components/StickySidebarNav';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './policy.module.css';

const defaultTermsData = {
  lastUpdated: "October 15, 2023",
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      paragraphs: ["Welcome to Downtown Boutique. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms. If you do not agree with any part of these terms, you may not use our services."]
    },
    {
      id: "use-of-site",
      title: "2. Use of Site",
      paragraphs: ["You may use our site for lawful purposes only. You must not use our site in any way that causes, or may cause, damage to the site or impairment of the availability or accessibility of the site."],
      listItems: [
        "You must be at least 18 years of age to use this site.",
        "You must ensure that all information you supply to us is true, accurate, current, and complete."
      ]
    },
    {
      id: "intellectual-property",
      title: "3. Intellectual Property",
      paragraphs: ["All content included on this site, such as text, graphics, logos, images, audio clips, digital downloads, and data compilations, is the property of Downtown Boutique or its content suppliers and is protected by international copyright laws."]
    },
    {
      id: "products-pricing",
      title: "4. Products & Pricing",
      paragraphs: [
        "We strive to display our products and their colors as accurately as possible. However, the actual colors you see will depend on your monitor. All prices are subject to change without notice.",
        "In the event a product is listed at an incorrect price due to a typographical error, Downtown Boutique shall have the right to refuse or cancel any orders placed for products listed at the incorrect price."
      ]
    },
    {
      id: "orders",
      title: "5. Orders & Acceptance",
      paragraphs: ["Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute confirmation of our offer to sell. Downtown Boutique reserves the right at any time after receipt of your order to accept or decline your order for any reason."]
    },
    {
      id: "limitation-liability",
      title: "6. Limitation of Liability",
      paragraphs: ["In no event shall Downtown Boutique or its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of our site or products."]
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
