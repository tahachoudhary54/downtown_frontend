'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAIStylist } from '../../context/AIStylistContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLiveStock } from '../../context/RealtimeStockContext';

function OutfitRecommendation({ product, compact = false }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { closeStylist } = useAIStylist();
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (!product) return null;

  let initialStock = product.stock !== undefined ? product.stock : (product.totalStock || 0);
  if (product.variants && product.variants.length > 0) {
    initialStock = product.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  }
  const liveStock = useLiveStock(product._id || product.id, initialStock);

  const wished = isWishlisted(product);
  const isOutOfStock = liveStock === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[rgba(255,255,255,0.02)] border border-[rgba(200,169,106,0.1)] rounded-xl overflow-hidden group hover:border-[rgba(200,169,106,0.4)] hover:shadow-[0_8px_30px_rgba(200,169,106,0.1)] transition-all duration-300 flex flex-col justify-between"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111111]">
        <img 
          src={product.img} 
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />

        {/* Stock Status Badges on Image */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md border border-red-400/30 uppercase tracking-wider">
            Out of Stock
          </div>
        ) : liveStock <= 20 ? (
          <div className="absolute top-2 right-2 bg-amber-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md border border-amber-300/40 uppercase tracking-wider">
            Only {liveStock} Left
          </div>
        ) : product.matchPercentage ? (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-[#C8A96A] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-[#C8A96A]/30">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            {product.matchPercentage}% Match
          </div>
        ) : null}
      </div>

      <div className={`p-4 flex flex-col justify-between ${compact ? 'gap-2' : 'gap-3.5'} flex-1`}>
        <div>
          <h5 className="text-gray-100 font-semibold text-sm line-clamp-1 tracking-wide">{product.name}</h5>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
            <p className="text-[#C8A96A] text-xs tracking-wide font-bold">{product.price}</p>
            {isOutOfStock ? (
              <span className="text-[11px] text-red-400 font-medium flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">❌ Out of stock</span>
            ) : liveStock <= 20 ? (
              <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">⚡ Only {liveStock} left</span>
            ) : null}
          </div>
        </div>

        {product.selectedVariant && (
          <div className="text-[#C8A96A] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#C8A96A]/30 rounded w-max bg-[#C8A96A]/10">
            Selected: {product.selectedVariant.colorName}
          </div>
        )}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex gap-2.5">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeStylist();
                router.push(`/product/${product._id || product.id}${product.selectedVariant ? `?color=${product.selectedVariant.colorName}` : ''}`);
              }}
              className="flex-1 bg-transparent text-white text-center py-2.5 rounded-lg border border-white/20 text-xs font-medium hover:bg-white/10 transition-colors uppercase tracking-wider"
            >
              View
            </button>
            <button 
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isOutOfStock) {
                  addToCart({ ...product, selectedColor: product.selectedVariant?.colorName });
                }
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors uppercase tracking-wider ${
                isOutOfStock 
                  ? 'bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700/60' 
                  : 'bg-[#C8A96A] text-black hover:bg-[#e5c98f]'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(OutfitRecommendation);
