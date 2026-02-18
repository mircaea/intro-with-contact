'use client';

import { useState, useEffect } from 'react';
import { getPricing } from '@/lib/firestore';
import type { PricingItem } from '@/types';

export function usePricing() {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await getPricing();
        setPricing(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pricing'));
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  return { pricing, loading, error };
}
