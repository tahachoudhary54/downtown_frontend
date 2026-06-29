'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { AIChatProvider } from './AIChatContext';

const AIStylistModal = dynamic(() => import('../components/AIStylist/AIStylistModal'), { ssr: false });

const AIStylistContext = createContext({
  isOpen: false,
  initialContextPrompt: null,
  openStylist: () => {},
  closeStylist: () => {},
  preloadStylist: () => {}
});

export const useAIStylist = () => useContext(AIStylistContext);

export function AIStylistProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialContextPrompt, setInitialContextPrompt] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const openStylist = (prompt = null) => {
    setInitialContextPrompt(prompt);
    setIsOpen(true);
  };

  const closeStylist = () => {
    setIsOpen(false);
    setTimeout(() => setInitialContextPrompt(null), 300); // clear after animation
  };

  const preloadStylist = () => {
    import('../components/AIStylist/AIStylistModal');
  };

  return (
    <AIStylistContext.Provider value={{ isOpen, initialContextPrompt, openStylist, closeStylist, preloadStylist }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <AIChatProvider>
            <AIStylistModal onClose={closeStylist} initialPrompt={initialContextPrompt} />
          </AIChatProvider>
        )}
      </AnimatePresence>
    </AIStylistContext.Provider>
  );
}
