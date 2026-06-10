'use client';

import { useState } from 'react';
import styles from "../page.module.css";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'How do I place an order?',
      a: 'Browse our shop, select your preferred size, and click "Add to Cart". Once you\'re ready, proceed to checkout and fill in your shipping and payment details.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm) and Net Banking. All payments are processed securely.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Standard delivery takes 5–7 business days. Express delivery (2–3 business days) is also available at an additional charge. Orders are dispatched within 1–2 business days.',
    },
    {
      q: 'Is there free shipping?',
      a: 'Yes! We offer free standard shipping on all orders above ₹999. A flat ₹99 shipping fee applies to orders below ₹999.',
    },
    {
      q: 'Can I return or exchange a product?',
      a: 'Absolutely. We offer a 30-day return and exchange window from the date of delivery. Items must be unused, unwashed, and in original condition with all tags attached. Sale items are non-returnable.',
    },
    {
      q: 'How do I track my order?',
      a: 'Once your order is shipped, you\'ll receive a tracking number via email. You can also log in to your account and visit the "My Orders" section to track your order status.',
    },
    {
      q: 'What if I received a damaged or wrong item?',
      a: 'We\'re sorry to hear that! Please contact us at support@downtownboutique.com within 48 hours of delivery with a photo of the item, and we\'ll arrange a replacement or full refund immediately.',
    },
    {
      q: 'How do I find the right size?',
      a: 'Visit our Size Guide page for detailed measurements. If you\'re still unsure, feel free to reach out and our team will help you choose the perfect fit.',
    },
    {
      q: 'Can I cancel my order?',
      a: 'Orders can be cancelled within 12 hours of placement. Once dispatched, cancellations are not possible, but you may initiate a return after delivery.',
    },
    {
      q: 'How do I contact customer support?',
      a: 'You can reach us at support@downtownboutique.com or call +91 9867211505. We\'re available Monday to Saturday, 10 AM – 7 PM IST.',
    },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer} style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</h1>
          <div className={styles.sectionLine}></div>
        </div>

        <div style={{ padding: '2rem 0' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  borderBottom: '1px solid #E5DED5',
                  marginBottom: '0',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '1rem',
                  }}
                >
                  <span style={{
                    fontWeight: 600,
                    color: isOpen ? '#7A6552' : '#2E2A27',
                    fontSize: '0.97rem',
                    lineHeight: '1.5',
                    transition: 'color 0.2s',
                  }}>
                    {faq.q}
                  </span>
                  <span style={{
                    flexShrink: 0,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1.5px solid #7A6552',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7A6552',
                    fontSize: '1.1rem',
                    lineHeight: 1,
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                  }}>
                    +
                  </span>
                </button>

                <div style={{
                  maxHeight: isOpen ? '300px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}>
                  <p style={{
                    padding: '0 0 1.25rem 0',
                    color: 'rgba(46,42,39,0.75)',
                    lineHeight: '1.8',
                    fontSize: '0.95rem',
                    margin: 0,
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: '1rem', color: '#7A6552', fontSize: '0.9rem' }}>
          Can't find what you're looking for? <a href="/contact" style={{ color: '#7A6552', fontWeight: 600, textDecoration: 'underline' }}>Contact us</a> directly.
        </p>
      </section>
    </div>
  );
}
