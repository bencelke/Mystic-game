'use client';

import { useState, useEffect } from 'react';
import { FeaturesConfig } from '@/types/mystic';

interface UseFeaturesResult {
  config: FeaturesConfig | null;
  loading: boolean;
  error: string | null;
}

export function useFeatures(): UseFeaturesResult {
  const [config, setConfig] = useState<FeaturesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturesConfig();
  }, []);

  const loadFeaturesConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/features/config');
      if (!response.ok) {
        throw new Error('Failed to load features config');
      }
      
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        throw new Error(data.error || 'Failed to load features config');
      }
    } catch (err) {
      console.error('Error loading features config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Set default config on error
      setConfig({
        watchToEarnEnabled: true,
        watchCooldownMin: 30,
        watchDailyLimit: 5,
        dailyRitualEnabled: true,
        proFeaturesEnabled: true,
        socialFeaturesEnabled: false,
        offlineModeEnabled: false,
        inlineWheelEnabled: false,
        wheelDailyFree: 1,
        wheelDailyFreePro: 2,
        wheelAllowVisionExtra: true,
        wheelDailyMax: 5,
        wheelVisionPlacement: 'wheel'
      });
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, error };
}
