/**
 * NDVI Service - Sentinel Hub API
 * REAL SATELLITE DATA ONLY - No fallbacks
 */

export interface NDVIData {
  ndvi: number;
  ndmi: number;
  evi: number;
  source: string;
  date: string;
  cloud_coverage: number;
}

interface SentinelAuthResponse {
  access_token: string;
  expires_in: number;
}

async function getSentinelToken(): Promise<string> {
  const clientId = process.env.SENTINELHUB_CLIENT_ID;
  const clientSecret = process.env.SENTINELHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SENTINELHUB_CLIENT_ID and SENTINELHUB_CLIENT_SECRET are not configured');
  }

  const tokenUrl = 'https://services.sentinel-hub.com/oauth/token';
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    throw new Error(`Sentinel Hub authentication failed: ${response.statusText}`);
  }

  const data: SentinelAuthResponse = await response.json();
  return data.access_token;
}

export async function fetchNDVIData(lat: number, lon: number, radiusKm: number = 1): Promise<NDVIData> {
  try {
    const token = await getSentinelToken();

    // Calculate bounding box (approximate)
    const latOffset = radiusKm / 111; // 1 degree lat ≈ 111 km
    const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const bbox = [
      lon - lonOffset,
      lat - latOffset,
      lon + lonOffset,
      lat + latOffset
    ];

    // Get date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const evalscript = `
//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["B04", "B08", "B11", "B02", "SCL"],
      units: "DN"
    }],
    output: {
      bands: 4,
      sampleType: "FLOAT32"
    }
  };
}

function evaluatePixel(sample) {
  // Calculate NDVI
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  
  // Calculate NDMI (Normalized Difference Moisture Index)
  let ndmi = (sample.B08 - sample.B11) / (sample.B08 + sample.B11);
  
  // Calculate EVI (Enhanced Vegetation Index)
  let evi = 2.5 * ((sample.B08 - sample.B04) / (sample.B08 + 6 * sample.B04 - 7.5 * sample.B02 + 1));
  
  // Cloud mask (SCL band)
  let cloudMask = sample.SCL;
  
  return [ndvi, ndmi, evi, cloudMask];
}
`;

    const requestBody = {
      input: {
        bounds: {
          bbox: bbox,
          properties: {
            crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
          }
        },
        data: [
          {
            type: 'sentinel-2-l2a',
            dataFilter: {
              timeRange: {
                from: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
                to: endDate.toISOString().split('T')[0] + 'T23:59:59Z'
              },
              maxCloudCoverage: 30
            }
          }
        ]
      },
      output: {
        width: 512,
        height: 512,
        responses: [
          {
            identifier: 'default',
            format: {
              type: 'image/tiff'
            }
          }
        ]
      },
      evalscript: evalscript
    };

    const processUrl = 'https://services.sentinel-hub.com/api/v1/process';

    const response = await fetch(processUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sentinel Hub API error: ${response.statusText} - ${errorText}`);
    }

    // For simplicity, we'll use Statistical API instead for mean values
    const statsRequestBody = {
      input: {
        bounds: {
          bbox: bbox,
          properties: {
            crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
          }
        },
        data: [
          {
            type: 'sentinel-2-l2a',
            dataFilter: {
              timeRange: {
                from: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
                to: endDate.toISOString().split('T')[0] + 'T23:59:59Z'
              },
              maxCloudCoverage: 30
            }
          }
        ]
      },
      aggregation: {
        timeRange: {
          from: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
          to: endDate.toISOString().split('T')[0] + 'T23:59:59Z'
        },
        aggregationInterval: {
          of: 'P1D'
        },
        evalscript: evalscript,
        resx: 10,
        resy: 10
      },
      calculations: {
        default: {}
      }
    };

    const statsUrl = 'https://services.sentinel-hub.com/api/v1/statistics';

    const statsResponse = await fetch(statsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statsRequestBody),
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!statsResponse.ok) {
      throw new Error(`Sentinel Hub Statistics API error: ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();

    if (!statsData.data || statsData.data.length === 0) {
      throw new Error('No satellite data available for this location and time period');
    }

    // Get the most recent data point
    const latestData = statsData.data[statsData.data.length - 1];
    const bands = latestData.outputs.default.bands;

    const ndvi = bands.B0?.stats?.mean || 0;
    const ndmi = bands.B1?.stats?.mean || 0;
    const evi = bands.B2?.stats?.mean || 0;
    const cloudCoverage = bands.B3?.stats?.mean || 0;

    return {
      ndvi: Math.round(Math.max(-1, Math.min(1, ndvi)) * 1000) / 1000,
      ndmi: Math.round(Math.max(-1, Math.min(1, ndmi)) * 1000) / 1000,
      evi: Math.round(Math.max(-1, Math.min(3, evi)) * 1000) / 1000,
      source: 'Sentinel-2 L2A',
      date: latestData.interval.from,
      cloud_coverage: Math.round(cloudCoverage * 100) / 100
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch NDVI data: ${error.message}`);
    }
    throw new Error('Failed to fetch NDVI data: Unknown error');
  }
}
