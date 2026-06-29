'use client';

import { motion } from 'framer-motion';
import AIChatInterface from './AIChatInterface';

import { useAIChat } from '../../context/AIChatContext';
import AISidebar from './AISidebar';

export default function AIStylistModal({ onClose, initialPrompt }) {
  const { toggleSidebar } = useAIChat();

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
      >
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-6 border-b border-[#C8A96A]/25 bg-[#111111]">
          <div className="flex items-center gap-4">
            <button 
                onClick={toggleSidebar}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#C8A96A] hover:bg-[rgba(255,255,255,0.04)] transition-colors border border-[#C8A96A]/25"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <div>
              <h2 className="text-[#C8A96A] font-semibold text-xl tracking-wide uppercase">✨ Downtown AI Stylist</h2>
              <p className="text-[#888888] text-xs sm:text-sm mt-0.5 tracking-wider uppercase">
                Your Personal Fashion Concierge
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#C8A96A] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors border border-[#C8A96A]/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 overflow-hidden flex">
          <AISidebar />
          <div className="flex-1 min-w-0 h-full">
            <AIChatInterface initialPrompt={initialPrompt} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
