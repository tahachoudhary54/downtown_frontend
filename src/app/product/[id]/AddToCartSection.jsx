'use client';

import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import { generateWhatsAppMessage, trackWhatsAppClick } from "../../../utils/whatsapp";
import styles from "./product.module.css";

import { useLiveStock, useLiveVariants, useLiveVisibility } from "../../../context/RealtimeStockContext";
import ColorSelector from "./ColorSelector";

export default function AddToCartSection({ product, selectedColor, setSelectedColor }) {
  const variants = useLiveVariants(product._id || product.id, product.variants || []);
  const selectedVariantInfo = variants.find(v => v.colorName === selectedColor);
  const globalSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL"];
  const availableSizes = selectedVariantInfo && selectedVariantInfo.sizes && selectedVariantInfo.sizes.length > 0 
    ? selectedVariantInfo.sizes 
    : globalSizes;
  
  const firstAvailableSize = availableSizes.find(size => !(product.inventory && product.inventory[size] === 0)) || availableSizes[0];
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize || "");

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      const firstValid = availableSizes.find(size => {
        const isSizeOut = selectedColor && selectedVariantInfo && selectedVariantInfo.sizeInventory
          ? selectedVariantInfo.sizeInventory[size] === 0
          : product.inventory && product.inventory[size] === 0;
        return !isSizeOut;
      }) || availableSizes[0];
      setSelectedSize(firstValid || "");
    }
  }, [availableSizes, selectedSize, product.inventory, selectedColor, selectedVariantInfo]);
  const variantColors = variants.map(v => v.colorName);
  const globalColors = product.colors || [];
  
  let availableColors = Array.from(new Set([...globalColors, ...variantColors]));
  const hasVariants = availableColors.length > 0;
  
  if (hasVariants && product.img) {
     availableColors = ['Default', ...availableColors];
  }
  const [added, setAdded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);
  let initialStock = 0;
  if (selectedColor && selectedVariantInfo) {
    if (selectedSize && selectedVariantInfo.sizeInventory && selectedVariantInfo.sizeInventory[selectedSize] !== undefined) {
      initialStock = selectedVariantInfo.sizeInventory[selectedSize];
    } else {
      initialStock = selectedVariantInfo.stock !== undefined ? selectedVariantInfo.stock : 0;
    }
  } else if (variants.length > 0) {
    initialStock = variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  } else {
    initialStock = product.stock !== undefined ? product.stock : (product.totalStock || 0);
  }
  
  const liveStock = useLiveStock(product._id || product.id, initialStock);
  const liveVisibility = useLiveVisibility(product._id || product.id, product.inStock !== undefined ? product.inStock : true);

  // Use initialStock for variant-specific display because liveStock is the global product stock.
  // Also treat liveVisibility === false (inStock: false) as 0 stock.
  const effectiveStock = liveVisibility === false ? 0 : ((variants.length > 0 && selectedColor) ? initialStock : liveStock);

  let stockStatus = { text: '', className: '' };
  if (effectiveStock === 0) {
    stockStatus = { text: 'OUT OF STOCK', className: styles.stockOut };
  } else if (effectiveStock > 0 && effectiveStock <= 20) {
    stockStatus = { text: `ONLY ${effectiveStock} LEFT`, className: styles.stockLow };
  }

  const handleAddToCart = () => {
    if (effectiveStock === 0) return;
    
    let colorToAdd = selectedColor;
    if (availableColors.length > 0 && (!selectedColor || selectedColor === 'Default')) {
      // If no color selected or 'Default' selected, default to 'Default' instead of the first variant.
      // However, if they truly have no color, let's keep it empty so the backend doesn't complain about 'Default' color.
      colorToAdd = selectedColor === 'Default' ? '' : selectedColor;
    }
    
    addToCart(product, selectedSize, colorToAdd, 1);
    setAdded(true);
  };

  return (
    <>
      <p className={`${styles.stockIndicator} ${stockStatus.className}`}>
        {stockStatus.text}
      </p>

      {availableSizes.length > 0 && liveStock > 0 && (
        <div className={styles.sizes}>
          <h4>SELECT SIZE</h4>
          <div className={styles.sizeOptions}>
            {availableSizes.map((size) => {
              const isSizeOut = selectedColor && selectedVariantInfo && selectedVariantInfo.sizeInventory
                ? selectedVariantInfo.sizeInventory[size] === 0
                : product.inventory && product.inventory[size] === 0;

              return (
                <button
                  key={size}
                  className={`${selectedSize === size ? styles.active : ""} ${isSizeOut ? styles.sizeDisabled : ""}`}
                  onClick={() => setSelectedSize(size)}
                  disabled={isSizeOut}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ColorSelector
        variants={variants}
        product={product}
        availableColors={availableColors}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        className={styles.desktopColors}
      />

      <button
        className={`${styles.btnAddToCart} ${added ? styles.btnAdded : ""} ${effectiveStock === 0 ? styles.btnAddToCartDisabled : ""}`}
        onClick={handleAddToCart}
        disabled={effectiveStock === 0}
      >
        {effectiveStock === 0 ? "OUT OF STOCK" : added ? "✓ ADDED TO CART" : "ADD TO CART"}
      </button>

      <a 
        href={generateWhatsAppMessage({
          productName: product.name,
          selectedSize: availableSizes.length > 0 ? selectedSize : null,
          selectedColor: availableColors.length > 0 ? selectedColor : null,
          url: currentUrl,
        })}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btnWhatsAppProduct}
        onClick={() => trackWhatsAppClick({ url: window.location.href, productName: product.name })}
        title="Ask about this product"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '8px' }}>
          <path d="M12.031 0C5.398 0 0 5.4 0 12.031c0 2.628.847 5.08 2.316 7.112l-1.554 5.674 5.815-1.526A11.972 11.972 0 0012.031 24c6.632 0 12.031-5.399 12.031-12.031S18.663 0 12.031 0zm6.544 17.33c-.276.78-1.597 1.488-2.203 1.542-.562.05-1.288.196-4.103-1.002-3.567-1.517-5.836-5.143-6.012-5.378-.176-.235-1.436-1.913-1.436-3.649 0-1.737.91-2.585 1.233-2.922.321-.337.7-.421.935-.421.235 0 .47.001.675.011.213.01.498-.083.778.591.293.704.996 2.428 1.084 2.604.088.176.147.382.029.617-.118.235-.176.381-.352.587-.176.205-.371.442-.528.587-.176.162-.364.337-.164.689.199.352.887 1.474 1.91 2.385 1.315 1.171 2.41 1.534 2.763 1.696.352.162.558.147.763-.088.205-.235.887-1.026 1.122-1.378.235-.352.47-.293.793-.176.323.118 2.052.968 2.404 1.144.352.176.587.264.675.411.088.147.088.851-.188 1.631z"/>
        </svg>
        Chat on WhatsApp
      </a>

      {added && (
        <Link
          href="/cart"
          className={styles.btnViewCart}
          style={{ textAlign: 'center', textDecoration: 'none' }}
        >
          VIEW CART →
        </Link>
      )}
    </>
  );
}
