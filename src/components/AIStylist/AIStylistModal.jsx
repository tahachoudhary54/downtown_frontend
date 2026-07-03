'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatInterface from './AIChatInterface';

import { useAIChat } from '../../context/AIChatContext';
import AISidebar from './AISidebar';

export default function AIStylistModal({ onClose, initialPrompt }) {
  const { toggleSidebar, isSidebarOpen } = useAIChat();
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe left (close sidebar)
    if (diff > 50 && isSidebarOpen) {
      toggleSidebar();
    }
    // Swipe right (open sidebar)
    if (diff < -50 && !isSidebarOpen) {
      toggleSidebar();
    }
    
    setTouchStart(null);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-[#111111] overscroll-none" 
      style={{ zIndex: 2147483647, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full h-full bg-[#111111] overflow-hidden flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-3 py-3 lg:px-6 border-b border-[#C8A96A]/25 bg-[#111111]">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button 
                onClick={toggleSidebar}
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[#C8A96A] hover:bg-[rgba(255,255,255,0.04)] transition-colors border border-[#C8A96A]/25"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <div className="min-w-0">
              <h2 className="text-[#C8A96A] font-semibold text-[15px] sm:text-xl tracking-wide uppercase truncate flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4l5 5L8 21l-5-1 1-5z"/><path d="M15 4l5 5"/></svg>Downtown AI Stylist</h2>
              <p className="text-[#888888] text-[9px] sm:text-sm mt-0.5 tracking-wider uppercase truncate">
                Your Personal Fashion Concierge
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[#C8A96A] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors border border-[#C8A96A]/25 ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 overflow-hidden flex">
          {/* Mobile Overlay to close sidebar on outside click */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer"
                onClick={toggleSidebar}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isSidebarOpen && <AISidebar />}
          </AnimatePresence>
          <div className="flex-1 min-w-0 h-full">
            <AIChatInterface initialPrompt={initialPrompt} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
