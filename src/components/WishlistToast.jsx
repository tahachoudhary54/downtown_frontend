'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistToast({ toast }) {
  if (!toast) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id || Date.now()}
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed top-24 right-6 z-[2147483648] flex items-center gap-3 bg-[#1A1A1A] text-white px-4 py-3 rounded-xl border border-[#C8A96A]/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="w-7 h-7 rounded-full bg-[#C8A96A]/20 flex items-center justify-center text-[#C8A96A] text-sm font-bold flex-shrink-0">
          {toast.type === 'remove' ? '✕' : '✓'}
        </div>
        <div className="text-xs font-medium tracking-wide">
          <p className="text-gray-100 font-semibold">{toast.message}</p>
          {toast.subtitle && <p className="text-gray-400 text-[11px] mt-0.5">{toast.subtitle}</p>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
