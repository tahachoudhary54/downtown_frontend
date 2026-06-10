import styles from "../page.module.css";

export const metadata = {
  title: "Size Guide – Downtown Boutique",
  description: "Find your perfect fit with our comprehensive size guide for men's clothing at Downtown Boutique.",
  keywords: "size guide, mens sizing, clothing measurements, downtown boutique",
};

const sizeData = [
  { size: 'XS', chest: '34–36"', waist: '28–30"', hip: '34–36"', shoulder: '16.5"' },
  { size: 'S',  chest: '36–38"', waist: '30–32"', hip: '36–38"', shoulder: '17"'   },
  { size: 'M',  chest: '38–40"', waist: '32–34"', hip: '38–40"', shoulder: '17.5"' },
  { size: 'L',  chest: '40–42"', waist: '34–36"', hip: '40–42"', shoulder: '18"'   },
  { size: 'XL', chest: '42–44"', waist: '36–38"', hip: '42–44"', shoulder: '18.5"' },
  { size: 'XXL',chest: '44–46"', waist: '38–40"', hip: '44–46"', shoulder: '19"'   },
];

const pantData = [
  { size: '28', waist: '28"', inseam: '30"', hip: '35"' },
  { size: '30', waist: '30"', inseam: '30"', hip: '37"' },
  { size: '32', waist: '32"', inseam: '31"', hip: '39"' },
  { size: '34', waist: '34"', inseam: '32"', hip: '41"' },
  { size: '36', waist: '36"', inseam: '32"', hip: '43"' },
  { size: '38', waist: '38"', inseam: '32"', hip: '45"' },
];

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '2rem',
  fontSize: '0.95rem',
};
const thStyle = {
  background: '#2E2A27',
  color: '#fff',
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontWeight: 600,
  letterSpacing: '0.05em',
};
const tdStyle = {
  padding: '0.7rem 1rem',
  borderBottom: '1px solid #E5DED5',
  color: 'rgba(46,42,39,0.8)',
};
const trEvenStyle = { background: '#FAF8F5' };
const trOddStyle  = { background: '#F5F0EB' };

export default function SizeGuidePage() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionContainer} style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>SIZE GUIDE</h1>
          <div className={styles.sectionLine}></div>
        </div>

        <div style={{ padding: '2rem 0', lineHeight: '1.8', color: 'rgba(46,42,39,0.8)' }}>
          <p style={{ marginBottom: '2rem' }}>
            All measurements are in inches. For the best fit, measure yourself and compare with the chart below. If you are between sizes, we recommend sizing up.
          </p>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2E2A27', marginBottom: '1rem' }}>Tops — Shirts, T-Shirts & Outerwear</h2>
          <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Size</th>
                  <th style={thStyle}>Chest</th>
                  <th style={thStyle}>Waist</th>
                  <th style={thStyle}>Hip</th>
                  <th style={thStyle}>Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((row, i) => (
                  <tr key={row.size} style={i % 2 === 0 ? trEvenStyle : trOddStyle}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#2E2A27' }}>{row.size}</td>
                    <td style={tdStyle}>{row.chest}</td>
                    <td style={tdStyle}>{row.waist}</td>
                    <td style={tdStyle}>{row.hip}</td>
                    <td style={tdStyle}>{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2E2A27', marginBottom: '1rem' }}>Bottoms — Trousers & Jeans</h2>
          <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Waist Size</th>
                  <th style={thStyle}>Waist</th>
                  <th style={thStyle}>Inseam</th>
                  <th style={thStyle}>Hip</th>
                </tr>
              </thead>
              <tbody>
                {pantData.map((row, i) => (
                  <tr key={row.size} style={i % 2 === 0 ? trEvenStyle : trOddStyle}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#2E2A27' }}>{row.size}</td>
                    <td style={tdStyle}>{row.waist}</td>
                    <td style={tdStyle}>{row.inseam}</td>
                    <td style={tdStyle}>{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2E2A27', marginBottom: '0.75rem' }}>How to Measure</h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape parallel to the ground.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Waist:</strong> Measure around your natural waistline, just above the hip bone.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Hip:</strong> Measure around the fullest part of your hips and seat.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Shoulder:</strong> Measure from the edge of one shoulder to the other across the back.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Inseam:</strong> Measure from the crotch seam to the bottom of the leg.</li>
          </ul>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7A6552' }}>
            Still unsure? Contact us at <strong>support@downtownboutique.com</strong> and our team will help you find the perfect fit.
          </p>
        </div>
      </section>
    </div>
  );
}
