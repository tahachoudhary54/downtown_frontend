"use client";

import React from 'react';
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import IconHeartOutline from "../../components/IconHeartOutline";
import IconHeartFilled from "../../components/IconHeartFilled";
import styles from "../page.module.css";
import { useLiveStock } from "../../context/RealtimeStockContext";
import { getSalePricing } from "../../utils/price";

function WishlistItem({ item, toggleWishlist }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const liveStock = useLiveStock(item._id || item.id, item.stock !== undefined ? item.stock : (item.totalStock || 0));
  const { isSaleValid, originalPriceStr, salePriceStr } = getSalePricing(item);
  const imgSrc = item.img || item.image || (item.images && item.images[0]) || '/cat_t_shirt.png';
  const priceDisplay = typeof item.price === 'number' ? `₹${item.price}` : item.price;
  const productId = item._id || item.id;
  const isOutOfStock = liveStock === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between w-full sm:w-[260px]">
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer group"
        onClick={() => {
          if (productId) router.push(`/product/${productId}`);
        }}
      >
        <img 
          src={imgSrc} 
          alt={item.name} 
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
        />
        {isOutOfStock ? (
          <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
            Out of Stock
          </div>
        ) : liveStock <= 20 ? (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-black text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
            Only {liveStock} Left
          </div>
        ) : isSaleValid ? (
          <div className="absolute top-2.5 right-2.5 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
            SALE
          </div>
        ) : null}

        <button
          type="button"
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(item);
          }}
          title="Remove from Wishlist"
        >
          <IconHeartFilled />
        </button>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 gap-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
          
          {/* Variant & Size details */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {item.selectedVariant?.colorName && (
              <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase tracking-wider border border-gray-200">
                Color: {item.selectedVariant.colorName}
              </span>
            )}
            {item.selectedSize && (
              <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase tracking-wider border border-gray-200">
                Size: {item.selectedSize}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            {isSaleValid ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-400 line-through text-xs">{originalPriceStr}</span>
                <span className="text-gray-900 font-bold text-sm">{salePriceStr}</span>
              </div>
            ) : (
              <p className="text-gray-900 font-bold text-sm">{priceDisplay}</p>
            )}

            {isOutOfStock ? (
              <span className="text-[11px] text-red-600 font-semibold">Out of stock</span>
            ) : liveStock <= 20 ? (
              <span className="text-[11px] text-amber-600 font-medium">⚡ {liveStock} left</span>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium">In Stock</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => router.push(`/product/${productId}`)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 rounded text-xs font-semibold transition-colors uppercase tracking-wider"
            >
              View
            </button>
            <button 
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                if (!isOutOfStock) {
                  addToCart({ ...item, selectedColor: item.selectedVariant?.colorName });
                }
              }}
              className={`flex-1 py-2 rounded text-xs font-semibold transition-colors uppercase tracking-wider ${
                isOutOfStock 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
          <button 
            type="button"
            onClick={() => toggleWishlist(item)}
            className="w-full py-2 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 border border-red-200"
          >
            ✕ Remove from Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  return (
    <div className={styles.page} style={{ paddingTop: '120px', background: '#FAFAFA', minHeight: '80vh' }}>
      <div className={styles.wishlistContainer}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={styles.wishlistTitle} style={{ textAlign: 'left', margin: 0 }}>MY WISHLIST ({wishlist.length})</h2>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 text-2xl">
              ♡
            </div>
            <p style={{ fontSize: '1.1rem', color: '#444', fontWeight: 500 }}>Your wishlist is currently empty.</p>
            <p style={{ fontSize: '0.9rem', color: '#777', marginTop: '0.25rem' }}>Explore our collection or ask AI Stylist for recommendations!</p>
            <button
              style={{
                marginTop: '1.5rem',
                padding: '0.8rem 2rem',
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
              onClick={() => router.push('/shop')}
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-start">
            {wishlist.map((item) => (
              <WishlistItem key={item._id || item.id} item={item} toggleWishlist={toggleWishlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
