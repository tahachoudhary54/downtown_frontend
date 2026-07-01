'use client';

import PageHero from '@/components/PageHero';
import StickySidebarNav from '@/components/StickySidebarNav';
import { usePolicy } from '@/hooks/usePolicy';
import styles from '../terms-and-conditions/policy.module.css';

export const defaultPrivacyData = {
  lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  sections: [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      paragraphs: [
        "We may collect the following information when you create an account, place an order, or submit a return/exchange request:"
      ],
      listItems: [
        "Full Name",
        "Email Address",
        "Mobile Number",
        "Shipping Address",
        "Billing Address (if applicable)",
        "Order Details",
        "Payment Status",
        "Return & Exchange Requests",
        "Account Information"
      ]
    },
    {
      id: "information-we-collect-payment",
      title: "",
      paragraphs: [
        "Please note that payment information is securely processed by Razorpay and we do not store customers' banking credentials on our servers."
      ]
    },
    {
      id: "how-we-use-your-information",
      title: "2. How We Use Your Information",
      paragraphs: ["We use the information we collect to:"],
      listItems: [
        "Order processing",
        "WhatsApp communication",
        "Phone calls",
        "Delivery coordination",
        "Customer support",
        "Payment confirmation",
        "Return & exchange processing",
        "Account creation and management",
        "Website and service improvement",
        "Fraud and misuse prevention"
      ]
    },
    {
      id: "information-sharing",
      title: "3. Information Sharing",
      paragraphs: [
        "We do not sell or rent customer personal information.",
        "Customer information may only be shared with trusted service providers when necessary to provide our services, including:"
      ],
      listItems: [
        "Razorpay (Payment Processing)",
        "Porter (Order Delivery)",
        "Email Service Provider (for account verification, password reset, and notifications)"
      ]
    },
    {
      id: "information-sharing-legal",
      title: "",
      paragraphs: [
        "Information may also be shared when required by applicable law."
      ]
    },
    {
      id: "cookies-tracking",
      title: "4. Cookies & Tracking",
      paragraphs: [
        "We use cookies and similar tracking technologies to:"
      ],
      listItems: [
        "Keep users logged in.",
        "Remember preferences.",
        "Improve website performance.",
        "Analyze website usage.",
        "Enhance user experience."
      ]
    },
    {
      id: "cookies-tracking-disable",
      title: "",
      paragraphs: [
        "Users may disable cookies in their browser, although some features may not work correctly."
      ]
    },
    {
      id: "data-security",
      title: "5. Data Security",
      paragraphs: [
        "We take the security of your data seriously:"
      ],
      listItems: [
        "We use secure authentication.",
        "Passwords are securely encrypted.",
        "Sensitive information is protected.",
        "Payments are processed securely through Razorpay."
      ]
    },
    {
      id: "data-security-disclaimer",
      title: "",
      paragraphs: [
        "While we implement industry-standard security measures, no online system or method of electronic storage can guarantee absolute security."
      ]
    },
    {
      id: "your-rights",
      title: "6. Your Rights",
      paragraphs: ["As a customer, you have the right to:"],
      listItems: [
        "View your account information.",
        "Update your profile information.",
        "Change your password.",
        "Request account deletion (subject to legal or operational requirements).",
        "Contact us regarding privacy-related concerns."
      ]
    },
    {
      id: "data-retention",
      title: "7. Data Retention",
      paragraphs: ["We retain customer information only as long as necessary for:"],
      listItems: [
        "Order history",
        "Customer support",
        "Legal obligations",
        "Business operations"
      ]
    },
    {
      id: "third-party-services",
      title: "8. Third-Party Services",
      paragraphs: [
        "Our website uses trusted third-party services to ensure a seamless experience. These include Razorpay, Porter, and our Email Service Provider.",
        "Please note that each third-party service has its own privacy policy governing how they handle data."
      ]
    },
    {
      id: "changes-to-policy",
      title: "9. Changes to this Privacy Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time.",
        "Changes become effective immediately after being published on the website."
      ]
    },
    {
      id: "contact-us",
      title: "10. Contact Us",
      paragraphs: ["If you have any questions regarding this Privacy Policy, please reach out to us through the Contact Us page or via WhatsApp support."]
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
