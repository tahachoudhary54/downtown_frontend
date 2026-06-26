'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    setIsFirstVisit(true);
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={{ isAppReady, isFirstVisit }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
