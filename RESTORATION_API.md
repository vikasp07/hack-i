# 🌳 Real-Time Forest Restoration Data Engine

## Overview

Complete real-time data integration layer for the Intelligent Forest Restoration Platform. Fetches live forest restoration data from multiple free/open APIs.

## 🎯 Features

- ✅ **Geocoding**: Location → Coordinates (Nominatim/Mapbox)
- ✅ **Weather Data**: Live climate from OpenWeatherMap
- ✅ **Soil Properties**: SoilGrids API (pH, NPK, texture)
- ✅ **Vegetation Index**: NDVI proxy from forest cover
- ✅ **Forest Cover**: Global Forest Watch tree cover %
- ✅ **Carbon Tracking**: Biomass & sequestration estimates
- ✅ **Species Recommendations**: GBIF biodiversity data
- ✅ **Drought Index**: Multi-factor drought prediction (0-100)
- ✅ **Restoration Zones**: Auto-generated priority zones

## 📡 API Endpoint

### Base URL
```
http://localhost:3000/api/restoration
```

### Methods

#### GET Request
```bash
# Using location name
curl "http://localhost:3000/api/restoration?location=Mumbai,%20India"

# Using coordinates
curl "http://localhost:3000/api/restoration?lat=19.076&lon=72.878"
```

#### POST Request
```bash
# Using location
curl -X POST http://localhost:3000/api/restoration \
  -H "Content-Type: application/json" \
  -d '{"location": "Mumbai, India"}'

# Using coordinates
curl -X POST http://localhost:3000/api/restoration \
  -H "Content-Type: application/json" \
  -d '{"lat": 19.076, "lon": 72.878}'
```

## 📊 Response Format

```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "coordinates": {
      "lat": 19.076,
      "lon": 72.878
    },
    "weather": {
      "temp": 28.5,
      "humidity": 65,
      "rainfall": 2.3,
      "wind": 12.5,
      "conditions": "partly cloudy"
    },
    "soil": {
      "clay": 25.3,
      "silt": 42.1,
      "sand": 32.6,
      "pH": 6.8,
      "nitrogen": 3.2,
      "organic_carbon": 22.5
    },
    "ndvi": 0.65,
    "forest_cover": 42.3,
    "carbon": {
      "current_stock": 8450,
      "annual_sequestration": 148.5
    },
    "species": {
      "pioneers": [
        "Leucaena leucocephala",
        "Gliricidia sepium",
        "Acacia auriculiformis"
      ],
      "secondary": [
        "Swietenia mahagoni",
        "Tectona grandis",
        "Azadirachta indica"
      ],
      "climax": [
        "Dipterocarpus alatus",
        "Shorea robusta",
        "Ficus religiosa"
      ]
    },
    "drought_index": 35,
    "restoration_zones": [
      {
        "lat": 19.0812,
        "lon": 72.8923,
        "health_score": 68,
        "priority": "medium",
        "recommended_species": [
          "Leucaena leucocephala",
          "Gliricidia sepium",
          "Swietenia mahagoni"
        ]
      }
    ]
  }
}
```

## 🔑 Environment Variables

### Required
```env
OPENWEATHER_API_KEY=your_key_here
```

### Optional (for real data)
```env
GFW_API_KEY=your_gfw_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
SENTINELHUB_CLIENT_ID=your_sentinel_id
SENTINELHUB_CLIENT_SECRET=your_sentinel_secret
```

### Free APIs (No Key Required)
- SoilGrids API
- GBIF Species API
- Nominatim Geocoding

## 📈 Data Sources

### 1. Geocoding
- **Primary**: Mapbox Geocoding API (if token provided)
- **Fallback**: Nominatim OpenStreetMap (Free)
- **Rate Limit**: 1 req/sec (Nominatim)

### 2. Weather Data
- **Source**: OpenWeatherMap API
- **Data**: Temperature, humidity, rainfall, wind
- **Update**: Hourly
- **Free Tier**: 1,000 calls/day

### 3. Soil Properties
- **Source**: SoilGrids REST API (ISRIC)
- **Data**: Clay, silt, sand, pH, nitrogen, organic carbon
- **Resolution**: 250m
- **Free**: No key required

### 4. Vegetation Index (NDVI)
- **Source**: Derived from GFW tree cover
- **Formula**: `NDVI = (tree_cover / 100) * 0.7 + 0.1`
- **Range**: 0-1 (0 = bare soil, 1 = dense vegetation)

### 5. Forest Cover
- **Source**: Global Forest Watch Tree Cover Density
- **Data**: Tree cover percentage (2000 baseline)
- **Resolution**: 30m
- **Update**: Annual

### 6. Carbon Tracking
- **Method**: Estimated from forest cover
- **Formula**: 
  - Tropical: ~200 tons C/ha
  - Temperate: ~100 tons C/ha
  - Annual sequestration: ~3.5 tons C/ha/year

### 7. Species Recommendations
- **Source**: GBIF Occurrence API
- **Method**: Query 50km radius for plant species
- **Categories**: Pioneers, Secondary, Climax
- **Fallback**: Regional species database

### 8. Drought Index
**Multi-factor calculation (0-100):**
- Precipitation deficit: 30%
- Temperature stress: 20%
- Humidity deficit: 20%
- Soil water capacity: 15%
- Vegetation stress: 15%

**Interpretation:**
- 0-30: Low drought risk
- 31-60: Moderate drought risk
- 61-100: High drought risk

### 9. Restoration Zones
- **Generation**: 8 zones around search point
- **Radius**: ~5km
- **Priority**: Based on health score
  - High (red): health < 40
  - Medium (orange): health 40-70
  - Low (green): health > 70

## 🧪 Testing

### Test with curl
```bash
# Test geocoding
curl "http://localhost:3000/api/restoration?location=Amazon%20Rainforest"

# Test coordinates
curl "http://localhost:3000/api/restoration?lat=-3.4653&lon=-62.2159"

# Test POST
curl -X POST http://localhost:3000/api/restoration \
  -H "Content-Type: application/json" \
  -d '{"lat": 19.076, "lon": 72.878}'
```

### Test in browser
```
http://localhost:3000/api/restoration?lat=19.076&lon=72.878
```

### Expected Response Time
- With API keys: 2-5 seconds
- With mock data: < 1 second

## 🚀 Integration Examples

### React Component
```typescript
import { useEffect, useState } from 'react';

interface RestorationData {
  coordinates: { lat: number; lon: number };
  weather: any;
  soil: any;
  ndvi: number;
  forest_cover: number;
  carbon: any;
  species: any;
  drought_index: number;
  restoration_zones: any[];
}

export function useRestorationData(lat: number, lon: number) {
  const [data, setData] = useState<RestorationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/restoration?lat=${lat}&lon=${lon}`
        );
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch restoration data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lat, lon]);

  return { data, loading, error };
}
```

### Next.js Server Component
```typescript
import { fetchRestorationData } from '@/lib/services/dataService';

export default async function RestorationPage({
  searchParams
}: {
  searchParams: { lat: string; lon: string }
}) {
  const lat = parseFloat(searchParams.lat);
  const lon = parseFloat(searchParams.lon);
  
  const data = await fetchRestorationData(undefined, lat, lon);
  
  return (
    <div>
      <h1>Restoration Data</h1>
      <p>Forest Cover: {data.forest_cover}%</p>
      <p>NDVI: {data.ndvi}</p>
      <p>Drought Index: {data.drought_index}</p>
    </div>
  );
}
```

## 🔧 Troubleshooting

### "Location not found"
- Check spelling of location name
- Try using coordinates instead
- Ensure location exists in OpenStreetMap

### "Weather API failed"
- Verify OPENWEATHER_API_KEY is set
- Check API key is active
- Ensure not exceeding rate limits

### "GFW API failed"
- Verify GFW_API_KEY is set
- Check coordinates are valid
- App will use mock data as fallback

### Slow response times
- Enable caching in production
- Use coordinates instead of location names
- Consider implementing Redis cache

## 📝 Notes

1. **Mock Data**: App works without API keys using realistic mock data
2. **Caching**: Responses cached for 1 hour (configurable)
3. **Rate Limits**: Respects API provider rate limits
4. **Fallbacks**: Graceful degradation if APIs fail
5. **Validation**: Input validation for coordinates and location

## 🌍 Example Locations

```bash
# Tropical Rainforest
curl "http://localhost:3000/api/restoration?lat=-3.4653&lon=-62.2159"

# Temperate Forest
curl "http://localhost:3000/api/restoration?lat=48.8566&lon=2.3522"

# Savanna
curl "http://localhost:3000/api/restoration?lat=-1.2921&lon=36.8219"

# Boreal Forest
curl "http://localhost:3000/api/restoration?lat=64.2008&lon=-149.4937"
```

## 📚 API Documentation Links

- [OpenWeatherMap](https://openweathermap.org/api)
- [Global Forest Watch](https://www.globalforestwatch.org/developers)
- [SoilGrids](https://rest.isric.org/soilgrids/v2.0/docs)
- [GBIF](https://www.gbif.org/developer/summary)
- [Nominatim](https://nominatim.org/release-docs/develop/api/Overview/)
- [Mapbox](https://docs.mapbox.com/api/search/geocoding/)

## 🎉 Success!

Your Real-Time Forest Restoration Data Engine is ready! Start fetching live data with a single API call.
