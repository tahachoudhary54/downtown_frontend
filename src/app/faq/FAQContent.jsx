'use client';

import PageHero from '@/components/PageHero';
import Accordion from '@/components/Accordion';
import Link from 'next/link';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './faq.module.css';

// Default data is used if DB fetch fails or is empty
export const defaultFaqData = [
  {
    category: "Orders",
    items: [
      { question: "How can I track my order?", answer: "Customers can track order status from their account in the \"My Orders\" section. Status updates are provided after admin confirmation." },
      { question: "Can I modify or cancel my order?", answer: "Orders may be cancelled before accepting the delivery charge. Once the delivery charge is accepted, cancellation may not be possible." }
    ]
  },
  {
    category: "Shipping",
    items: [
      { question: "How does delivery work?", answer: "After you place an order, our admin contacts you to share the delivery charge. Once you approve the delivery charge, Porter is booked for your order. You pay the Porter delivery charge directly to the delivery partner during delivery." },
      { question: "What are your shipping charges?", answer: "Delivery charges are calculated individually through Porter after order confirmation. They depend on your location and are communicated to you by our admin before dispatch." },
      { question: "Do you ship internationally?", answer: "No. Currently we deliver only within India." }
    ]
  },
  {
    category: "Returns & Exchanges",
    items: [
      { question: "How do returns work?", answer: "Customers can submit return requests from their account within 48 hours of delivery for damaged, defective, or incorrect products. The customer pays the return shipping charges. Once the returned product is received and inspected, the refund is processed." },
      { question: "How long does it take to receive a refund?", answer: "Once the returned product has been received and approved after inspection, refunds are processed to the original payment method within approximately 7 business days. If you reject the delivery charge before dispatch, your order is cancelled and the product payment is refunded within approximately 7 business days." }
    ]
  },
  {
    category: "Payments",
    items: [
      { question: "What payment methods do you accept?", answer: "We accept secure online payments through Razorpay using UPI and Net Banking." },
      { question: "Is my payment information secure?", answer: "Yes. All online payments are securely processed through Razorpay using industry-standard encryption to ensure your payment information remains safe and confidential." }
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
          <p className={styles.supportText}>Our support team is available to assist you with any questions regarding your orders, payments, returns, and exchanges.</p>
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
