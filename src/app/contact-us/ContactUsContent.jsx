'use client';

import PageHero from '@/components/PageHero';
import Link from 'next/link';
import { useState } from 'react';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './contact.module.css';

const defaultContactData = {
  heroTitle: "Contact Us",
  heroSubtitle: "We're here to assist you with any inquiries regarding our collections, your orders, or styling advice.",
  clientServicesTitle: "Client Services",
  clientServicesDesc: "Our dedicated team of advisors is available to provide personalized assistance.",
  email: "support@downtownboutique.com",
  phone: "+1 (800) 123-4567",
  businessHours: [
    "Monday - Friday: 9am - 8pm EST",
    "Saturday: 10am - 6pm EST"
  ],
  whatsappLink: "https://wa.me/919867211505",
  whatsappText: "Instant support from our styling team"
};

export default function ContactUsContent() {
  const { data: contactData, loading } = usePolicy('contactUs', defaultContactData);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/tickets/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus(''), 8000);
      } else {
        setStatus('error');
        alert(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      alert('Network error. Please try again later.');
    }
  };

  return (
    <div className={styles.page}>
      <PageHero 
        title={contactData?.heroTitle || "Contact Us"} 
        subtitle={contactData?.heroSubtitle || ""}
      />
      
      <div className={styles.container}>
        {loading ? (
          <div className="text-center py-10 opacity-50">Loading Contact Information...</div>
        ) : (
          <div className={styles.layout}>
            {/* Left Column: Info */}
            <div className={styles.infoCol}>
              <div className={styles.infoCard}>
                <h2 className={styles.title}>{contactData.clientServicesTitle}</h2>
                <p className={styles.desc}>{contactData.clientServicesDesc}</p>
                
                <div className={styles.contactDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>✉️</span>
                    <div>
                      <strong>Email</strong>
                      <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📞</span>
                    <div>
                      <strong>Phone</strong>
                      <a href={`tel:${contactData.phone.replace(/[^0-9+]/g, '')}`}>{contactData.phone}</a>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🕒</span>
                    <div>
                      <strong>Business Hours</strong>
                      {contactData.businessHours?.map((hour, i) => (
                        <span key={i}>{hour}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <a href={contactData.whatsappLink} target="_blank" rel="noopener noreferrer" className={styles.whatsappCard}>
                <div className={styles.waIcon}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12.031 0C5.398 0 0 5.4 0 12.031c0 2.628.847 5.08 2.316 7.112l-1.554 5.674 5.815-1.526A11.972 11.972 0 0012.031 24c6.632 0 12.031-5.399 12.031-12.031S18.663 0 12.031 0zm6.544 17.33c-.276.78-1.597 1.488-2.203 1.542-.562.05-1.288.196-4.103-1.002-3.567-1.517-5.836-5.143-6.012-5.378-.176-.235-1.436-1.913-1.436-3.649 0-1.737.91-2.585 1.233-2.922.321-.337.7-.421.935-.421.235 0 .47.001.675.011.213.01.498-.083.778.591.293.704.996 2.428 1.084 2.604.088.176.147.382.029.617-.118.235-.176.381-.352.587-.176.205-.371.442-.528.587-.176.162-.364.337-.164.689.199.352.887 1.474 1.91 2.385 1.315 1.171 2.41 1.534 2.763 1.696.352.162.558.147.763-.088.205-.235.887-1.026 1.122-1.378.235-.352.47-.293.793-.176.323.118 2.052.968 2.404 1.144.352.176.587.264.675.411.088.147.088.851-.188 1.631z"/></svg>
                </div>
                <div className={styles.waContent}>
                  <h3>Chat on WhatsApp</h3>
                  <p>{contactData.whatsappText}</p>
                </div>
              </a>

              <div className={styles.faqLink}>
                <p>Have a quick question?</p>
                <Link href="/faq">Check our FAQ page</Link>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className={styles.formCol}>
              <div className={styles.formWrapper}>
                <h2 className={styles.title}>Send a Message</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <select 
                      id="subject" 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="order">Order Inquiry</option>
                      <option value="return">Returns & Exchanges</option>
                      <option value="product">Product Information</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea 
                      id="message" 
                      rows="5" 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`${styles.submitBtn} ${status === 'sending' ? styles.sending : ''}`}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                  
                  {status === 'success' && (
                    <div className={styles.successMsg}>
                      Thank you! Your message has been sent successfully. We will get back to you shortly.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
