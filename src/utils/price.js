
export function formatPrice(priceStr) {
  if (!priceStr) return '';
  let str = String(priceStr).trim();
  if (!str.includes('₹') && !str.includes('$')) {
    return `₹${str}`;
  }
  return str;
}

export function getSalePricing(product) {
  if (!product) return { isSaleValid: false, originalPriceStr: '', salePriceStr: '' };

  const priceStr = product.price || '';
  const originalPriceStr = product.originalPrice || '';
  const isOnSale = product.isOnSale === true;

  if (!isOnSale || !priceStr || !originalPriceStr) {
    return { isSaleValid: false, originalPriceStr: formatPrice(originalPriceStr), salePriceStr: formatPrice(priceStr) };
  }

  // Extract numeric values for comparison
  const priceVal = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  const originalPriceVal = parseFloat(originalPriceStr.replace(/[^0-9.]/g, ''));

  // Ensure parsing was successful and original price is strictly greater than the sale price
  if (!isNaN(priceVal) && !isNaN(originalPriceVal) && originalPriceVal > priceVal) {
    return { isSaleValid: true, originalPriceStr: formatPrice(originalPriceStr), salePriceStr: formatPrice(priceStr) };
  }

  // Fallback if not a valid sale
  return { isSaleValid: false, originalPriceStr: formatPrice(originalPriceStr), salePriceStr: formatPrice(priceStr) };
}
