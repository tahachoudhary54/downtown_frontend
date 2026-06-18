'use client';

import PageHero from '@/components/PageHero';
import Accordion from '@/components/Accordion';
import Link from 'next/link';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './faq.module.css';

// Default data is used if DB fetch fails or is empty
const defaultFaqData = [
  {
    category: "Orders",
    items: [
      { question: "How can I track my order?", answer: "Once your order has shipped, you will receive an email with your tracking number. You can also view your order status by logging into your account." },
      { question: "Can I modify or cancel my order?", answer: "We process orders quickly, but if you contact us within 1 hour of placing your order, we may be able to modify or cancel it. Please reach out to our support team immediately." }
    ]
  },
  {
    category: "Shipping",
    items: [
      { question: "What are your shipping rates?", answer: "We offer complimentary standard shipping on all orders over $200. For orders under $200, a flat rate of $15 applies. Express shipping is available for $25." },
      { question: "Do you ship internationally?", answer: "Yes, we ship to select international destinations. International shipping rates and delivery times vary by location and will be calculated at checkout." }
    ]
  },
  {
    category: "Returns",
    items: [
      { question: "What is your return policy?", answer: "We accept returns on unworn, unwashed items with tags attached within 30 days of delivery. Custom or personalized items are final sale." },
      { question: "How do I process a return?", answer: "To initiate a return, log into your account and navigate to 'My Orders', or contact our support team. A return shipping label will be provided." }
    ]
  },
  {
    category: "Payments",
    items: [
      { question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay." },
      { question: "Is my payment information secure?", answer: "Yes, we use industry-standard encryption protocols to ensure your payment information is kept secure and confidential." }
    ]
  }
];

export default function FAQContent() {
  const { data: faqData, loading } = usePolicy('faq', defaultFaqData);

  return (
    <div className={styles.page}>
      <PageHero 
        title="Frequently Asked Questions" 
        subtitle="Find answers to common questions about orders, delivery, returns, and payments."
      />
      
      <div className={styles.container}>
        {loading ? (
          <div className="text-center py-10 opacity-50">Loading FAQs...</div>
        ) : Array.isArray(faqData) ? (
          faqData.map((section, idx) => (
            <section key={idx} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>{section.category}</h2>
              <Accordion items={section.items} />
            </section>
          ))
        ) : (
          defaultFaqData.map((section, idx) => (
            <section key={idx} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>{section.category}</h2>
              <Accordion items={section.items} />
            </section>
          ))
        )}

        <section className={styles.supportCta}>
          <h2 className={styles.supportTitle}>Still Need Help?</h2>
          <p className={styles.supportText}>Our client advisors are available to assist you with any inquiries.</p>
          <div className={styles.actionButtons}>
            <Link href="/contact-us" className={styles.contactBtn}>Contact Us</Link>
            <a href="https://wa.me/919867211505" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
