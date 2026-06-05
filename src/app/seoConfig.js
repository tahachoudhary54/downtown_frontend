// Central SEO metadata mapping for the Next.js app.
import { products } from "../data/products";
// Static routes mapping to meta data.
export const staticSeo = {
  "/signup": {
    title: "Sign Up – Downtown Store",
    description: "Create your account to shop the latest fashion at Downtown Store.",
    keywords: "signup, account, fashion, downtown store",
    ogImage: "/static/og-signup.jpg",
    twitterCard: "summary_large_image",
  },
  "/shop": {
    title: "Shop – Downtown Store",
    description: "Browse our collection of clothing, accessories, and more.",
    keywords: "shop, clothing, accessories, downtown",
    ogImage: "/static/og-shop.jpg",
    twitterCard: "summary_large_image",
  },
  "/privacy": {
    title: "Privacy Policy – Downtown Store",
    description: "Read how Downtown Store handles your personal data and privacy.",
    keywords: "privacy, policy, data protection",
    ogImage: "/static/og-privacy.jpg",
    twitterCard: "summary",
  },
  "/terms": {
    title: "Terms & Conditions – Downtown Store",
    description: "Review the terms and conditions for using Downtown Store services.",
    keywords: "terms, conditions, policy",
    ogImage: "/static/og-terms.jpg",
    twitterCard: "summary",
  },
  "/about": {
    title: "About Us – Downtown Store",
    description: "Learn more about Downtown Store, our mission, and our team.",
    keywords: "about, company, downtown store",
    ogImage: "/static/og-about.jpg",
    twitterCard: "summary",
  },
};

// Helper for dynamic product pages (product/[id])
export async function getProductSeo(params) {
  const { id } = await params;
  // products imported via ES module at top
  const product = products.find((p) => p.id === id);

  if (!product) {
    return {
      title: "Product Not Found – Downtown Store",
      description: "The requested product does not exist.",
      keywords: "product, not found",
      ogImage: "/static/og-product.jpg",
      twitterCard: "summary",
    };
  }
  return {
    title: `${product.name} – Downtown Store`,
    description: product.description,
    keywords: product.tags?.join(", ") || "product, downtown store",
    ogImage: product.image || "/static/og-product.jpg",
    twitterCard: "summary_large_image",
  };
}
