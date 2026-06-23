import Image from "next/image";
import Link from "next/link";
import { fetchProductById } from "../../../lib/api";
import AddToCartSection from "./AddToCartSection";
import styles from "./product.module.css";
import { getSalePricing } from "../../../utils/price";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await fetchProductById(resolvedParams.id);
  
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product does not exist.",
    };
  }

  const title = product.name;
  const description = product.description;
  const image = product.img || "/hero_bg.png";

  return {
    title: title,
    description: description,
    keywords: [product.category, "fashion", "menswear", "downtown boutique"],
    openGraph: {
      title: title,
      description: description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [image],
    },
  };
}

import ProductDisplayClient from "./ProductDisplayClient";

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const product = await fetchProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <ProductDisplayClient product={product} />
    </div>
  );
}
