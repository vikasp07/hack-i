/**
 * React Hook for Restoration Data
 * Easy integration with frontend components
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  RestorationData,
  RestorationDataHookParams,
  UseRestorationDataResult
} from '@/lib/types/restoration';

export function useRestorationData({
  lat,
  lon,
  location,
  enabled = true
}: RestorationDataHookParams = {}): UseRestorationDataResult {
  const [data, setData] = useState<RestorationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if disabled or no parameters provided
    if (!enabled || (!location && (lat === undefined || lon === undefined))) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build URL based on parameters
      let url = '/api/restoration';
      if (lat !== undefined && lon !== undefined) {
        url += `?lat=${lat}&lon=${lon}`;
      } else if (location) {
        url += `?location=${encodeURIComponent(location)}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch restoration data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [lat, lon, location, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for fetching restoration data with POST method
 */
export function useRestorationDataPost() {
  const [data, setData] = useState<RestorationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params: { lat?: number; lon?: number; location?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/restoration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        const errorMsg = result.message || 'Failed to fetch restoration data';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData
  };
}

/**
 * Hook for monitoring drought index changes
 */
export function useDroughtMonitor(lat?: number, lon?: number, intervalMs: number = 3600000) {
  const [droughtIndex, setDroughtIndex] = useState<number | null>(null);
  const [trend, setTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable');
  const [history, setHistory] = useState<Array<{ timestamp: string; value: number }>>([]);

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;

    const fetchDroughtData = async () => {
      try {
        const response = await fetch(`/api/restoration?lat=${lat}&lon=${lon}`);
        const result = await response.json();

        if (result.success) {
          const newIndex = result.data.drought_index;
          setDroughtIndex(newIndex);

          // Update history
          const newEntry = {
            timestamp: new Date().toISOString(),
            value: newIndex
          };
          setHistory(prev => [...prev.slice(-9), newEntry]); // Keep last 10 entries

          // Calculate trend
          if (history.length > 0) {
            const lastValue = history[history.length - 1].value;
            const diff = newIndex - lastValue;
            if (Math.abs(diff) < 5) {
              setTrend('stable');
            } else if (diff > 0) {
              setTrend('increasing');
            } else {
              setTrend('decreasing');
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch drought data:', err);
      }
    };

    // Initial fetch
    fetchDroughtData();

    // Set up interval
    const interval = setInterval(fetchDroughtData, intervalMs);

    return () => clearInterval(interval);
  }, [lat, lon, intervalMs, history]);

  return {
    droughtIndex,
    trend,
    history
  };
}

/**
 * Hook for comparing multiple locations
 */
export function useLocationComparison(locations: Array<{ lat: number; lon: number; name: string }>) {
  const [data, setData] = useState<Array<{ name: string; data: RestorationData }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = locations.map(async (loc) => {
        const response = await fetch(`/api/restoration?lat=${loc.lat}&lon=${loc.lon}`);
        const result = await response.json();
        return {
          name: loc.name,
          data: result.data
        };
      });

      const results = await Promise.all(promises);
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  }, [locations]);

  useEffect(() => {
    if (locations.length > 0) {
      fetchAllLocations();
    }
  }, [fetchAllLocations, locations]);

  return {
    data,
    loading,
    error,
    refetch: fetchAllLocations
  };
}
