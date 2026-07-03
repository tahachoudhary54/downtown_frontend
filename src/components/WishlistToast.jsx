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
        <div className="w-7 h-7 rounded-full bg-[#C8A96A]/20 flex items-center justify-center text-[#C8A96A] flex-shrink-0">
          {toast.type === 'remove' 
            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <div className="text-xs font-medium tracking-wide">
          <p className="text-gray-100 font-semibold">{toast.message}</p>
          {toast.subtitle && <p className="text-gray-400 text-[11px] mt-0.5">{toast.subtitle}</p>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
