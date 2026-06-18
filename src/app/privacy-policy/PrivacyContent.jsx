'use client';

import PageHero from '@/components/PageHero';
import StickySidebarNav from '@/components/StickySidebarNav';
import { usePolicy } from '@/hooks/usePolicy';
import styles from '../terms-and-conditions/policy.module.css';

const defaultPrivacyData = {
  lastUpdated: "October 15, 2023",
  sections: [
    {
      id: "data-collection",
      title: "1. Data Collection",
      paragraphs: ["We collect information that you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, shipping address, billing address, and payment information."]
    },
    {
      id: "use-of-data",
      title: "2. Use of Your Data",
      paragraphs: ["We use the information we collect to provide, maintain, and improve our services. Specifically, we use your data to:"],
      listItems: [
        "Process your transactions and send you related information, including order confirmations and receipts.",
        "Send you technical notices, updates, security alerts, and support messages.",
        "Respond to your comments, questions, and customer service requests.",
        "Communicate with you about products, services, offers, and events offered by Downtown Boutique."
      ]
    },
    {
      id: "data-sharing",
      title: "3. Data Sharing",
      paragraphs: ["We do not share your personal information with third parties except as described in this privacy policy. We may share your information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf."]
    },
    {
      id: "cookies",
      title: "4. Cookies & Tracking",
      paragraphs: ["We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."]
    },
    {
      id: "security",
      title: "5. Security",
      paragraphs: ["The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security."]
    },
    {
      id: "your-rights",
      title: "6. Your Rights",
      paragraphs: ["You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you."]
    }
  ]
};

export default function PrivacyContent() {
  const { data: privacyData, loading } = usePolicy('privacyPolicy', defaultPrivacyData);

  if (typeof privacyData === 'string') {
    return (
      <div className={styles.page}>
        <PageHero title="Privacy Policy" subtitle="Your privacy is critically important to us." />
        <div className={styles.container}>
          <div className={styles.policyCard} style={{ whiteSpace: 'pre-wrap' }}>
            {privacyData}
          </div>
        </div>
      </div>
    );
  }

  const sectionsForNav = privacyData?.sections?.map(s => ({ id: s.id, title: s.title })) || [];

  return (
    <div className={styles.page}>
      <PageHero 
        title="Privacy Policy" 
        subtitle="Your privacy is critically important to us. Learn how we protect your personal information."
      />
      
      <div className={styles.container}>
        {loading ? (
          <div className="text-center py-10 opacity-50">Loading Privacy Policy...</div>
        ) : (
          <div className={styles.layout}>
            {sectionsForNav.length > 0 && (
              <aside className={styles.sidebarCol}>
                <StickySidebarNav sections={sectionsForNav} />
              </aside>
            )}
            
            <main className={styles.contentCol}>
              <div className={styles.policyCard}>
                {privacyData?.lastUpdated && (
                  <p className={styles.lastUpdated}>Last Updated: {privacyData.lastUpdated}</p>
                )}

                {privacyData?.sections?.map((section, idx) => (
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
