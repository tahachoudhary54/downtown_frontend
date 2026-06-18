'use client';

import PageHero from '@/components/PageHero';
import { usePolicy } from '@/hooks/usePolicy';
import styles from './size-guide.module.css';

const defaultSizeData = {
  heroTitle: "Find Your Perfect Fit",
  heroSubtitle: "Detailed measurements and fit guidance to ensure your selections are perfectly tailored to you.",
  tableHeaders: ["Size", "Chest (in)", "Waist (in)", "Sleeve (in)", "Neck (in)"],
  tableRows: [
    ["XS", "34-36", "28-30", "32.5", "14-14.5"],
    ["S", "38-40", "32-34", "33.5", "15-15.5"],
    ["M", "42-44", "36-38", "34.5", "16-16.5"],
    ["L", "46-48", "40-42", "35.5", "17-17.5"],
    ["XL", "50-52", "44-46", "36.5", "18-18.5"],
    ["XXL", "54-56", "48-50", "37.5", "19-19.5"]
  ],
  fitCards: [
    { title: "Slim Fit", desc: "Tailored close to the body for a sharp, modern silhouette. Ideal for a refined look." },
    { title: "Regular Fit", desc: "A classic, comfortable cut with moderate room through the chest and waist." },
    { title: "Relaxed Fit", desc: "Generously cut for ease of movement and a more casual, laid-back aesthetic." }
  ],
  measurementSteps: [
    { title: "Chest", desc: "Measure under your arms, around the fullest part of your chest." },
    { title: "Waist", desc: "Measure around your natural waistline, keeping the tape comfortably loose." },
    { title: "Sleeve", desc: "Start at the center back of your neck, measure across the shoulder to your wrist." }
  ],
  expertTip: "If you are between sizes for a tailored garment, we recommend selecting the larger size and consulting a tailor for the perfect finish."
};

export default function SizeGuideContent() {
  const { data: sizeData, loading } = usePolicy('sizeGuide', defaultSizeData);

  return (
    <div className={styles.page}>
      <PageHero 
        title={sizeData?.heroTitle || "Find Your Perfect Fit"} 
        subtitle={sizeData?.heroSubtitle || ""}
      />
      
      <div className={styles.container}>
        {loading ? (
          <div className="text-center py-10 opacity-50">Loading Size Guide...</div>
        ) : (
          <div className={styles.layout}>
            {/* Left Column: Sizing Table */}
            <div className={styles.leftCol}>
              <h2 className={styles.sectionTitle}>Men's International Sizing</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.sizeTable}>
                  <thead>
                    <tr>
                      {sizeData.tableHeaders?.map((h, i) => <th key={i}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.tableRows?.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => <td key={j}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.fitGuideSection}>
                <h2 className={styles.sectionTitle}>Fit Guidelines</h2>
                <div className={styles.fitCards}>
                  {sizeData.fitCards?.map((card, i) => (
                    <div key={i} className={styles.fitCard}>
                      <h3>{card.title}</h3>
                      <p>{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Illustration/Tips */}
            <div className={styles.rightCol}>
              <div className={styles.measurementCard}>
                <h3 className={styles.measurementTitle}>How to Measure</h3>
                
                {sizeData.measurementSteps?.map((step, i) => (
                  <div key={i} className={styles.measureStep}>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                ))}
                
                <div className={styles.illustrationPlaceholder}>
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v16M8 8h8M6 12h12M8 16h8"></path>
                  </svg>
                  <span>Measurement Guide</span>
                </div>
              </div>

              <div className={styles.expertTip}>
                <span className={styles.tipIcon}>✨</span>
                <div>
                  <strong>Stylist's Tip:</strong>
                  <p>{sizeData.expertTip}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
