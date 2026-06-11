
export function getSalePricing(product) {
  if (!product) return { isSaleValid: false, originalPriceStr: '', salePriceStr: '' };

  const priceStr = product.price || '';
  const originalPriceStr = product.originalPrice || '';
  const isOnSale = product.isOnSale === true;

  if (!isOnSale || !priceStr || !originalPriceStr) {
    return { isSaleValid: false, originalPriceStr, salePriceStr: priceStr };
  }

  // Extract numeric values for comparison
  const priceVal = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  const originalPriceVal = parseFloat(originalPriceStr.replace(/[^0-9.]/g, ''));

  // Ensure parsing was successful and original price is strictly greater than the sale price
  if (!isNaN(priceVal) && !isNaN(originalPriceVal) && originalPriceVal > priceVal) {
    // Add currency symbol if missing
    let formattedOriginal = originalPriceStr;
    if (!formattedOriginal.includes('₹') && !formattedOriginal.includes('$')) {
      formattedOriginal = `₹${formattedOriginal}`;
    }

    return { isSaleValid: true, originalPriceStr: formattedOriginal, salePriceStr: priceStr };
  }

  // Fallback if not a valid sale
  return { isSaleValid: false, originalPriceStr, salePriceStr: priceStr };
}
