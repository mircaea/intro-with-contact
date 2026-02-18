'use client';

import { useState, useEffect } from 'react';
import { getSettings } from '@/lib/firestore';
import type { Settings } from '@/types';

const defaultSettings: Settings = {
  siteName: 'Psihoterapie',
  contactEmail: 'contact@example.com',
  phone: '+40 700 000 000',
  address: 'Bucuresti, Romania',
  defaultTheme: 'light',
  defaultLanguage: 'ro',
  socialLinks: {},
  calendar: {
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    workingHours: { start: '09:00', end: '18:00' },
    sessionDuration: 50,
    bufferTime: 10,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        if (data) {
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
