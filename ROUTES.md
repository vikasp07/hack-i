# Habitat API Routes Documentation

This document describes all API endpoints used by the Habitat Adaptive Reforestation Platform. When you configure a `BACKEND_URL` environment variable, all requests will be proxied to your backend server at the specified endpoints.

## Environment Configuration

Add the following to your `.env` file:

```env
# Backend URL (optional - if not set, uses built-in mock data/GIS tools)
BACKEND_URL=https://your-backend-server.com

# Required for GIS tools (if not using external backend)
SENTINELHUB_CLIENT_ID=your_sentinel_hub_client_id
SENTINELHUB_CLIENT_SECRET=your_sentinel_hub_client_secret
OPENWEATHER_API_KEY=your_openweather_api_key
GFW_API_KEY=your_global_forest_watch_api_key

# Required for AI Chat
OPENAI_API_KEY=your_openai_api_key
```

---

## API Endpoints

### 1. Sector Analysis

**Endpoint:** `POST /api/sector/analyze`

Performs comprehensive sector analysis including satellite imagery processing, species recommendations, soil analysis, and afforestation site detection.

**Request Body:**
```json
{
  "lat": 19.076,
  "lng": 72.878,
  "radius": 5
}
```

**Response:**
```json
{
  "status": "success",
  "coordinates": {
    "lat": 19.076,
    "lng": 72.878
  },
  "metrics": {
    "health_score": 78,
    "ndvi_current": 0.65,
    "soil_ph": 6.8,
    "moisture_index": 45,
    "lst_temp": 32.5,
    "aqi": 85,
    "forest_cover": 42.3,
    "carbon_sequestration": 156.8
  },
  "history": [
    {
      "month": "Jan",
      "ndvi": 0.4,
      "rainfall": 120,
      "temperature": 28,
      "moisture": 35
    }
    // ... 12 months of data
  ],
  "species": [
    {
      "name": "Neem",
      "type": "Native",
      "suitability": 95,
      "waterRequirement": "Low",
      "carbonCapture": 25,
      "description": "Drought-resistant native species",
      "droughtTolerance": 90,
      "mineralSensitivity": 20
    }
    // ... more species
  ],
  "soilProfile": {
    "ph": 6.8,
    "nitrogen": 280,
    "phosphorus": 45,
    "potassium": 180,
    "organicMatter": 3.2,
    "texture": "Loamy"
  },
  "alerts": [
    {
      "id": "1",
      "type": "warning",
      "message": "Drought risk detected in Zone A",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "ndviAnalysis": {
    "cells": [
      {
        "lat": 19.076,
        "lng": 72.878,
        "ndvi": 0.65,
        "moisture": 45,
        "temperature": 32,
        "composite": 0.72
      }
    ],
    "optimalZones": [],
    "affectedMetric": "both",
    "correlationStrength": 0.78
  },
  "afforestationSites": [
    {
      "id": "site-19.076-72.878-0",
      "lat": 19.086,
      "lng": 72.888,
      "ndvi": 0.25,
      "ndmi": 0.35,
      "suitabilityScore": 78,
      "area": 15.5,
      "category": "high",
      "bounds": [
        { "lat": 19.081, "lng": 72.883 },
        { "lat": 19.081, "lng": 72.893 },
        { "lat": 19.091, "lng": 72.893 },
        { "lat": 19.091, "lng": 72.883 }
      ]
    }
  ]
}
```

---

### 2. Monitoring Data

**Endpoint:** `GET /api/monitoring?lat={lat}&lng={lng}`

Fetches real-time monitoring data including metrics, history, and alerts.

**Query Parameters:**
- `lat` (number): Latitude coordinate
- `lng` (number): Longitude coordinate

**Response:**
```json
{
  "metrics": {
    "health_score": 75,
    "ndvi_current": 0.6,
    "soil_ph": 6.5,
    "moisture_index": 50,
    "lst_temp": 30,
    "aqi": 80,
    "forest_cover": 40,
    "carbon_sequestration": 120
  },
  "history": [
    {
      "month": "Jan",
      "ndvi": 0.4,
      "rainfall": 120,
      "temperature": 28,
      "moisture": 35
    }
    // ... 12 months
  ],
  "alerts": [
    {
      "id": "alert-123",
      "type": "warning",
      "message": "High temperature alert",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Weather Data

**Endpoint:** `GET /api/weather?lat={lat}&lng={lng}`

Fetches current weather and forecast data.

**Query Parameters:**
- `lat` (number): Latitude coordinate
- `lng` (number): Longitude coordinate

**Response:**
```json
{
  "temperature": 28,
  "humidity": 65,
  "rainfall": 2.5,
  "windSpeed": 12,
  "conditions": "partly cloudy",
  "forecast": [
    {
      "date": "2024-01-15",
      "temp": 28,
      "rain": 2
    },
    {
      "date": "2024-01-16",
      "temp": 27,
      "rain": 5
    }
  ]
}
```

---

### 4. Soil Profile

**Endpoint:** `GET /api/soil?lat={lat}&lng={lng}`

Fetches soil composition and characteristics.

**Query Parameters:**
- `lat` (number): Latitude coordinate
- `lng` (number): Longitude coordinate

**Response:**
```json
{
  "soilProfile": {
    "ph": 6.8,
    "nitrogen": 280,
    "phosphorus": 45,
    "potassium": 180,
    "organicMatter": 3.2,
    "texture": "Loamy",
    "drainage": "Well-drained"
  }
}
```

---

### 5. Satellite Data (NDVI/NDMI)

**Endpoint:** `POST /api/satellite`

Fetches satellite imagery analysis with NDVI and NDMI indices.

**Request Body:**
```json
{
  "lat": 19.076,
  "lng": 72.878,
  "radius": 5
}
```

**Response:**
```json
{
  "ndviAvg": 0.28,
  "ndmiAvg": 0.15,
  "suitabilityScore": 52,
  "optimalZones": [
    {
      "lat": 19.086,
      "lng": 72.888,
      "score": 78
    }
  ],
  "heatmapImageUrl": "https://..." // Optional: URL to rendered heatmap image
}
```

---

### 6. Deforestation Alerts

**Endpoint:** `GET /api/deforestation?lat={lat}&lng={lng}&radius={radius}`

Fetches deforestation alerts from Global Forest Watch.

**Query Parameters:**
- `lat` (number): Latitude coordinate
- `lng` (number): Longitude coordinate
- `radius` (number): Search radius in km

**Response:**
```json
{
  "totalAlerts": 156,
  "recentAlerts": 12,
  "alertsByMonth": [
    { "month": "Jan", "count": 25 },
    { "month": "Feb", "count": 18 }
  ],
  "hotspots": [
    {
      "lat": 19.086,
      "lng": 72.888,
      "severity": "high",
      "date": "2024-01-10"
    }
  ]
}
```

---

### 7. Species Recommendations

**Endpoint:** `POST /api/species/recommend`

Gets species recommendations based on environmental conditions.

**Request Body:**
```json
{
  "lat": 19.076,
  "lng": 72.878,
  "soilPh": 6.5,
  "temperature": 28,
  "rainfall": 1200
}
```

**Response:**
```json
{
  "species": [
    {
      "name": "Neem",
      "type": "Native",
      "suitability": 95,
      "waterRequirement": "Low",
      "carbonCapture": 25,
      "description": "Excellent match for local conditions",
      "droughtTolerance": 90,
      "mineralSensitivity": 20
    }
  ]
}
```

---

### 8. Calamity Simulation

**Endpoint:** `POST /api/simulation/run`

Simulates the impact of environmental calamities on selected species.

**Request Body:**
```json
{
  "scenario": {
    "type": "drought",
    "severity": 70,
    "duration": 8,
    "affectedArea": 60
  },
  "selectedSpecies": ["Neem", "Teak", "Bamboo"],
  "lat": 19.076,
  "lng": 72.878
}
```

**Scenario Types:**
- `drought` - Water scarcity simulation
- `flood` - Excess water/flooding
- `heat_wave` - Extreme temperature events
- `frost` - Cold damage simulation
- `pest_outbreak` - Pest/disease impact
- `mineral_depletion` - Soil nutrient deficiency

**Response:**
```json
{
  "scenario": {
    "type": "drought",
    "severity": 70,
    "duration": 8,
    "affectedArea": 60
  },
  "speciesImpact": [
    {
      "species": {
        "name": "Neem",
        "type": "Native",
        "suitability": 95,
        "waterRequirement": "Low",
        "carbonCapture": 25,
        "description": "",
        "droughtTolerance": 90,
        "mineralSensitivity": 20
      },
      "survivalRate": 85,
      "growthImpact": 15,
      "recoveryTime": 6
    }
  ],
  "metricsImpact": {
    "ndvi": -25,
    "moisture": -35,
    "soilHealth": -10,
    "carbonCapture": -12
  },
  "recommendations": [
    "Implement drip irrigation systems to conserve water",
    "Apply mulching to reduce soil moisture evaporation"
  ]
}
```

---

### 9. Ecosystem Predictions

**Endpoint:** `POST /api/predictions`

Generates ecosystem predictions and timeline projections.

**Request Body:**
```json
{
  "lat": 19.076,
  "lng": 72.878,
  "timelineMonths": 36,
  "selectedSpecies": ["Neem", "Bamboo"]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "timeframe": "1 Month",
      "ndviPrediction": 0.38,
      "confidenceInterval": [0.32, 0.44],
      "riskFactors": [
        {
          "factor": "Water Stress",
          "probability": 0.3,
          "impact": "medium"
        }
      ],
      "optimalActions": [
        "Ensure adequate irrigation",
        "Apply mulch for moisture retention"
      ]
    }
  ],
  "timelineData": [
    {
      "month": 0,
      "waterRetention": 10,
      "aqiImprovement": 5,
      "temperatureReduction": 0.2,
      "carbonSequestration": 0,
      "treeMaturity": 0
    },
    {
      "month": 36,
      "waterRetention": 48,
      "aqiImprovement": 35,
      "temperatureReduction": 2.2,
      "carbonSequestration": 120,
      "treeMaturity": 75
    }
  ],
  "ecosystemBenefits": [
    { "category": "Carbon Capture", "value": 450, "percentage": 35 },
    { "category": "Biodiversity", "value": 78, "percentage": 25 },
    { "category": "Soil Health", "value": 75, "percentage": 20 },
    { "category": "Water Cycle", "value": 48, "percentage": 20 }
  ]
}
```

---

### 10. AI Chat

**Endpoint:** `POST /api/chat`

AI-powered conversational interface with GIS tool calling capabilities.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Analyze the satellite data for coordinates 19.076, 72.878"
        }
      ]
    }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream with AI responses and tool invocations.

**Available Tools:**
- `analyzeSatellite` - Fetch and analyze NDVI/NDMI from Sentinel Hub
- `getWeather` - Get current weather and forecast
- `checkDeforestation` - Check Global Forest Watch alerts
- `analyzeSoil` - Get soil composition from SoilGrids
- `recommendSpecies` - Get species recommendations
- `predictImpact` - Calculate ecosystem impact predictions

---

## Backend Implementation Notes

When implementing your own backend, ensure:

1. **CORS Configuration:** Allow requests from your frontend domain
2. **Rate Limiting:** Implement appropriate rate limiting for external API calls
3. **Caching:** Cache satellite and weather data to reduce API calls
4. **Error Handling:** Return consistent error responses:
   ```json
   {
     "error": "Error message",
     "details": "Optional detailed message"
   }
   ```
5. **Authentication:** Consider adding API key authentication for production

## Type Definitions

All TypeScript types are defined in `/lib/types.ts`. Key types include:

- `ApiResponse` - Full sector analysis response
- `Metrics` - Ecosystem health metrics
- `Species` - Species recommendation data
- `SoilProfile` - Soil composition data
- `CalamityScenario` - Simulation input parameters
- `SimulationResult` - Simulation output
- `PredictionData` - Prediction results
