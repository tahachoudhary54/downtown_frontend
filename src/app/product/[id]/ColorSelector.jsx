'use client';

import styles from "./product.module.css";

export default function ColorSelector({ variants, product, availableColors, selectedColor, setSelectedColor, className }) {
  if (availableColors.length === 0) return null;

  return (
    <div className={`${styles.sizes} ${className || ""}`} style={{ marginTop: '1.5rem' }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.05em' }}>
        {variants.some(v => v.images && v.images.length > 0) ? "AVAILABLE COLORS" : "SELECT COLOR"}
      </h4>
      <div className={styles.sizeOptions} style={{ gap: variants.some(v => v.images && v.images.length > 0) ? '10px' : (variants.some(v => v.colorCode) ? '12px' : '8px'), flexWrap: 'wrap' }}>
        {availableColors.map((color) => {
          const variant = variants.find(v => v.colorName === color);
          
          // If ANY variant has an image, we should show all as images to be consistent.
          // Fallback to the main product.img for variants that don't have a specific image.
          const hasAnyVariantImages = variants.some(v => v.images && v.images.length > 0);
          const swatchImage = (variant && variant.images && variant.images.length > 0) ? variant.images[0] : product.img;

          if (hasAnyVariantImages && swatchImage) {
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={color}
                style={{ 
                  position: 'relative', width: '60px', height: '80px', padding: 0, cursor: 'pointer',
                  border: selectedColor === color ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '4px', overflow: 'hidden'
                }}
              >
                <img src={swatchImage} alt={color} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            );
          }

          if (variant && variant.colorCode) {
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', padding: 0, 
                  backgroundColor: variant.colorCode, border: selectedColor === color ? '2px solid var(--accent)' : '1px solid var(--border)',
                  boxShadow: selectedColor === color ? '0 0 0 2px white inset' : 'none'
                }}
                title={color}
              />
            );
          }
          return (
            <button
              key={color}
              className={`${styles.colorTextOption} ${selectedColor === color ? styles.active : ""}`}
              onClick={() => setSelectedColor(color)}
            >
              {color}
            </button>
          );
        })}
      </div>
    </div>
  );
}
