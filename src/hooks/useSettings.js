'use client';

import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useSettings(fallbackData = null) {
  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`,
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3 seconds
      revalidateOnFocus: true, // Revalidate when window gets focus
      revalidateOnReconnect: true,
      fallbackData: fallbackData ? { success: true, data: fallbackData } : undefined,
    }
  );

  return {
    settings: data?.data || fallbackData,
    isLoading: !error && !data && !fallbackData,
    isError: error,
    mutate
  };
}
