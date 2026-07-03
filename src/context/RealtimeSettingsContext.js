"use client";

import React, { createContext, useContext, useEffect, useTransition } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';

const RealtimeSettingsContext = createContext(null);

export const RealtimeSettingsProvider = ({ children }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Connect to the backend socket
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to real-time settings sync');
    });

    // Listen for settings_updated event from the server
    socket.on('settings_updated', (newSettings) => {
      console.log("Settings updated in real-time, syncing client and server states...");
      
      // 1. Instantly update any Client Components using SWR hooks (like EssentialsSlider)
      mutate(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/settings`, { success: true, data: newSettings }, false);
      
      // 2. Trigger Next.js Server Component refresh wrapped in startTransition for robustness
      startTransition(() => {
        router.refresh();
      });
    });

    socket.on('data_updated', (info) => {
      console.log("Data updated globally, triggering refresh...", info);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      if (info && info.type) {
        let endpointPrefix = "";
        switch (info.type) {
          case "product":
            endpointPrefix = `${apiUrl}/api/products`;
            break;
          case "category":
            endpointPrefix = `${apiUrl}/api/categories`;
            break;
          case "collection":
            endpointPrefix = `${apiUrl}/api/collections`;
            break;
          case "settings":
            endpointPrefix = `${apiUrl}/api/settings`;
            break;
          case "review":
            endpointPrefix = `${apiUrl}/api/reviews`;
            break;
        }

        if (endpointPrefix) {
          mutate(
            (key) => typeof key === 'string' && key.startsWith(endpointPrefix),
            undefined,
            { revalidate: true }
          );
        }
      }

      startTransition(() => {
        router.refresh();
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  return (
    <RealtimeSettingsContext.Provider value={{}}>
      {children}
    </RealtimeSettingsContext.Provider>
  );
};

export const useRealtimeSettings = () => useContext(RealtimeSettingsContext);
