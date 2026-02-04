/**
 * API Client Utilities
 * Centralized API clients for external services
 */

import { env } from './env';

// ============================================
// OpenWeatherMap API Client
// ============================================
export const weatherApi = {
  baseUrl: 'https://api.openweathermap.org/data/2.5',
  
  async getCurrentWeather(lat: number, lon: number) {
    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${env.openWeatherApiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API request failed');
    return response.json();
  },
  
  async getForecast(lat: number, lon: number) {
    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${env.openWeatherApiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather forecast request failed');
    return response.json();
  },
};

// ============================================
// Sentinel Hub API Client
// ============================================
export const sentinelApi = {
  authUrl: 'https://services.sentinel-hub.com/oauth/token',
  processUrl: 'https://services.sentinel-hub.com/api/v1/process',
  
  async getAccessToken() {
    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env.sentinelHubClientId,
        client_secret: env.sentinelHubClientSecret,
      }),
    });
    
    if (!response.ok) throw new Error('Sentinel Hub auth failed');
    const data = await response.json();
    return data.access_token;
  },
  
  async getNDVI(bbox: number[], date: string, token: string) {
    const response = await fetch(this.processUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          bounds: { bbox, properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' } },
          data: [{
            type: 'sentinel-2-l2a',
            dataFilter: { timeRange: { from: date, to: date } },
          }],
        },
        output: { width: 512, height: 512, responses: [{ identifier: 'default', format: { type: 'image/png' } }] },
        evalscript: `
          //VERSION=3
          function setup() { return { input: ["B04", "B08"], output: { bands: 1 } }; }
          function evaluatePixel(sample) {
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            return [ndvi];
          }
        `,
      }),
    });
    
    if (!response.ok) throw new Error('Sentinel Hub NDVI request failed');
    return response.blob();
  },
};

// ============================================
// Global Forest Watch API Client
// ============================================
export const gfwApi = {
  baseUrl: 'https://data-api.globalforestwatch.org',
  
  async getDeforestationData(lat: number, lon: number, startYear: number, endYear: number) {
    const url = `${this.baseUrl}/dataset/umd_tree_cover_loss/latest/query?sql=SELECT * FROM data WHERE lat=${lat} AND lon=${lon} AND year>=${startYear} AND year<=${endYear}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${env.gfwApiKey}` },
    });
    
    if (!response.ok) throw new Error('GFW API request failed');
    return response.json();
  },
  
  async getForestCoverChange(geostore: string) {
    const url = `${this.baseUrl}/forest-change/umd-tree-cover-loss/admin/${geostore}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${env.gfwApiKey}` },
    });
    
    if (!response.ok) throw new Error('GFW forest cover request failed');
    return response.json();
  },
};

// ============================================
// SoilGrids API Client (No Auth Required)
// ============================================
export const soilGridsApi = {
  baseUrl: 'https://rest.isric.org/soilgrids/v2.0',
  
  async getSoilProperties(lat: number, lon: number) {
    const properties = ['clay', 'sand', 'silt', 'phh2o', 'soc', 'nitrogen'];
    const depths = ['0-5cm', '5-15cm', '15-30cm'];
    
    const url = `${this.baseUrl}/properties/query?lon=${lon}&lat=${lat}&property=${properties.join('&property=')}&depth=${depths.join('&depth=')}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('SoilGrids API request failed');
    return response.json();
  },
};

// ============================================
// GBIF Species API Client (No Auth Required)
// ============================================
export const gbifApi = {
  baseUrl: 'https://api.gbif.org/v1',
  
  async matchSpecies(scientificName: string) {
    const url = `${this.baseUrl}/species/match?name=${encodeURIComponent(scientificName)}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('GBIF API request failed');
    return response.json();
  },
  
  async searchSpecies(query: string, limit = 20) {
    const url = `${this.baseUrl}/species/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('GBIF search failed');
    return response.json();
  },
};

// ============================================
// NASA AppEEARS API Client
// ============================================
export const nasaApi = {
  baseUrl: 'https://appeears.earthdatacloud.nasa.gov/api',
  
  async submitNDVITask(coordinates: { latitude: number; longitude: number }[], startDate: string, endDate: string) {
    const response = await fetch(`${this.baseUrl}/task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.ndviToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_type: 'point',
        task_name: `NDVI_${Date.now()}`,
        params: {
          dates: [{ startDate, endDate }],
          layers: [{ product: 'MOD13Q1.061', layer: 'NDVI' }],
          coordinates,
        },
      }),
    });
    
    if (!response.ok) throw new Error('NASA AppEEARS task submission failed');
    return response.json();
  },
  
  async getTaskStatus(taskId: string) {
    const response = await fetch(`${this.baseUrl}/task/${taskId}`, {
      headers: { 'Authorization': `Bearer ${env.ndviToken}` },
    });
    
    if (!response.ok) throw new Error('NASA task status request failed');
    return response.json();
  },
};

// ============================================
// Mapbox API Client
// ============================================
export const mapboxApi = {
  baseUrl: 'https://api.mapbox.com',
  
  async geocode(query: string) {
    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${env.mapboxAccessToken}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Mapbox geocoding failed');
    return response.json();
  },
  
  async reverseGeocode(lon: number, lat: number) {
    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${env.mapboxAccessToken}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Mapbox reverse geocoding failed');
    return response.json();
  },
};
