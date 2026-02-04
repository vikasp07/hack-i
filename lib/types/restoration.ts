/**
 * TypeScript Type Definitions for Restoration API
 */

// ============================================
// CORE DATA TYPES
// ============================================

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  wind: number;
  conditions: string;
}

export interface SoilData {
  clay: number;
  silt: number;
  sand: number;
  pH: number;
  nitrogen: number;
  organic_carbon: number;
}

export interface CarbonData {
  current_stock: number;
  annual_sequestration: number;
}

export interface SpeciesData {
  pioneers: string[];
  secondary: string[];
  climax: string[];
}

export type ZonePriority = 'high' | 'medium' | 'low';

export interface RestorationZone {
  lat: number;
  lon: number;
  health_score: number;
  priority: ZonePriority;
  recommended_species: string[];
}

export interface RestorationData {
  coordinates: Coordinates;
  weather: WeatherData;
  soil: SoilData;
  ndvi: number;
  forest_cover: number;
  carbon: CarbonData;
  species: SpeciesData;
  drought_index: number;
  restoration_zones: RestorationZone[];
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface RestorationRequest {
  location?: string;
  lat?: number;
  lon?: number;
}

export interface RestorationSuccessResponse {
  success: true;
  timestamp: string;
  data: RestorationData;
}

export interface RestorationErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

export type RestorationResponse = RestorationSuccessResponse | RestorationErrorResponse;

// ============================================
// EXTERNAL API TYPES
// ============================================

// OpenWeatherMap API
export interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  weather: Array<{
    description: string;
  }>;
}

// SoilGrids API
export interface SoilGridsResponse {
  properties: {
    layers: Array<{
      name: string;
      depths: Array<{
        values: {
          mean: number;
        };
      }>;
    }>;
  };
}

// GBIF API
export interface GBIFOccurrence {
  scientificName: string;
  kingdom: string;
}

export interface GBIFResponse {
  results: GBIFOccurrence[];
}

// Nominatim API
export interface NominatimResult {
  lat: string;
  lon: string;
}

// Mapbox API
export interface MapboxFeature {
  center: [number, number]; // [lon, lat]
}

export interface MapboxResponse {
  features: MapboxFeature[];
}

// Global Forest Watch API
export interface GFWResponse {
  data: Array<{
    tcd_2000: number;
  }>;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface DroughtFactors {
  precipDeficit: number;
  tempStress: number;
  humidityDeficit: number;
  soilCapacity: number;
  vegetationStress: number;
}

export interface HealthMetrics {
  ndvi: number;
  forestCover: number;
  droughtIndex: number;
  soilQuality: number;
}

export interface ZoneGenerationParams {
  centerLat: number;
  centerLon: number;
  radius: number;
  numZones: number;
  baseHealthScore: number;
}

// ============================================
// CONSTANTS
// ============================================

export const DROUGHT_INDEX_WEIGHTS = {
  PRECIP_DEFICIT: 0.30,
  TEMP_STRESS: 0.20,
  HUMIDITY_DEFICIT: 0.20,
  SOIL_CAPACITY: 0.15,
  VEGETATION_STRESS: 0.15
} as const;

export const PRIORITY_THRESHOLDS = {
  HIGH: 40,
  MEDIUM: 70
} as const;

export const CARBON_ESTIMATES = {
  TROPICAL_BIOMASS_PER_HA: 200,
  TEMPERATE_BIOMASS_PER_HA: 100,
  ANNUAL_SEQUESTRATION_PER_HA: 3.5,
  TROPICAL_LATITUDE_THRESHOLD: 23.5
} as const;

export const NDVI_CONVERSION = {
  SCALE_FACTOR: 0.7,
  BASE_OFFSET: 0.1
} as const;

// ============================================
// TYPE GUARDS
// ============================================

export function isRestorationSuccessResponse(
  response: RestorationResponse
): response is RestorationSuccessResponse {
  return response.success === true;
}

export function isRestorationErrorResponse(
  response: RestorationResponse
): response is RestorationErrorResponse {
  return response.success === false;
}

export function isValidCoordinates(lat: unknown, lon: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

// ============================================
// HELPER TYPES
// ============================================

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseRestorationDataResult {
  data: RestorationData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface RestorationDataHookParams {
  lat?: number;
  lon?: number;
  location?: string;
  enabled?: boolean;
}
