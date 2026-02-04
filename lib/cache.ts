/**
 * Simple in-memory cache for API responses
 */

import { env } from './env';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now() + (ttl || env.cacheDuration) * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.store.clear();
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export const cache = new Cache();

// Cache key generators
export const cacheKeys = {
  weather: (lat: number, lon: number) => `weather:${lat}:${lon}`,
  soil: (lat: number, lon: number) => `soil:${lat}:${lon}`,
  ndvi: (lat: number, lon: number, date: string) => `ndvi:${lat}:${lon}:${date}`,
  species: (name: string) => `species:${name}`,
  deforestation: (lat: number, lon: number, year: number) => `deforestation:${lat}:${lon}:${year}`,
};
