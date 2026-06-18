export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919867211505";

/**
 * Generates a WhatsApp wa.me link with a pre-filled, URL-encoded message
 * @param {Object} params
 * @param {string} params.text - The base message text
 * @param {string} params.productName - (Optional) Product name
 * @param {string} params.selectedSize - (Optional) Selected size
 * @param {string} params.url - (Optional) URL to include
 * @returns {string} The formatted WhatsApp URL
 */
export const generateWhatsAppMessage = ({ text, productName, selectedSize, url }) => {
  let message = text || "Hi Downtown Boutique, I am interested in your collection. Please share more details.";

  if (productName) {
    message = `Hi Downtown Boutique, I am interested in the product: ${productName}`;
    if (selectedSize) {
      message += ` (Size: ${selectedSize})`;
    }
    message += `. Please share pricing and availability.`;
  }

  if (url) {
    message += `\n\nProduct Link: ${url}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

/**
 * Tracks a WhatsApp button click to the backend analytics API
 * @param {Object} params
 * @param {string} params.url - The URL where the click happened
 * @param {string} params.productName - (Optional) The product name if on a product page
 */
export const trackWhatsAppClick = async ({ url, productName }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    await fetch(`${apiUrl}/api/analytics/whatsapp-click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        productName: productName || null,
      }),
    });
  } catch (error) {
    console.error("Failed to track WhatsApp click:", error);
  }
};
