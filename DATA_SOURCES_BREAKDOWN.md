# 🔍 Data Sources Breakdown - Real vs Simulated

## Overview

This document explains which data comes from **REAL external APIs** and which is **SIMULATED/CALCULATED** based on your API key configuration.

---

## 📊 Data Source Status

### ✅ REAL DATA (With API Keys)

#### 1. 📍 Geocoding
**Status:** ✅ REAL  
**Source:** Nominatim OpenStreetMap (FREE) or Mapbox (Optional)  
**API Key Required:** No (Nominatim) / Yes (Mapbox)  
**What You Get:**
- Real latitude/longitude from location names
- Actual place names and addresses
- Global coverage

**Example:**
```javascript
// Input: "Mumbai, India"
// Output: { lat: 19.0760, lon: 72.8777 } ← REAL coordinates
```

---

#### 2. 🌤️ Weather Data
**Status:** ✅ REAL (with key) / ⚠️ SIMULATED (without key)  
**Source:** OpenWeatherMap API  
**API Key Required:** YES - `OPENWEATHER_API_KEY`  
**What You Get (REAL):**
- Live temperature (°C)
- Current humidity (%)
- Actual rainfall (mm)
- Real wind speed (m/s)
- Current weather conditions

**What You Get (SIMULATED):**
- Climate-based estimates
- Latitude-adjusted temperatures
- Random but realistic values

**Example:**
```javascript
// WITH API KEY (REAL):
{
  temp: 28.5,        // ← Live from weather station
  humidity: 65,      // ← Real measurement
  rainfall: 2.3,     // ← Actual precipitation
  wind: 12.5,        // ← Real wind speed
  conditions: "partly cloudy" // ← Current conditions
}

// WITHOUT API KEY (SIMULATED):
{
  temp: 27,          // ← Calculated from latitude
  humidity: 68,      // ← Random realistic value
  rainfall: 1.5,     // ← Random estimate
  wind: 10.2,        // ← Random estimate
  conditions: "partly cloudy" // ← Generic
}
```

---

#### 3. 🌱 Soil Properties
**Status:** ✅ REAL (Always)  
**Source:** SoilGrids REST API (ISRIC)  
**API Key Required:** NO - FREE Public API  
**What You Get:**
- Real soil composition from 250m resolution global dataset
- Actual pH levels
- Real nitrogen content
- Measured organic carbon
- Clay/silt/sand percentages from soil samples

**Data Quality:** HIGH - Based on actual soil surveys and samples

**Example:**
```javascript
// ALWAYS REAL DATA:
{
  clay: 25.3,           // ← Real measurement (g/kg)
  silt: 42.1,           // ← Real measurement
  sand: 32.6,           // ← Real measurement
  pH: 6.8,              // ← Actual pH from samples
  nitrogen: 3.2,        // ← Real nitrogen content
  organic_carbon: 22.5  // ← Measured organic carbon
}
```

---

#### 4. 🌿 NDVI (Vegetation Index)
**Status:** ⚠️ CALCULATED (Proxy from Forest Cover)  
**Source:** Derived from Global Forest Watch tree cover  
**API Key Required:** Optional - `GFW_API_KEY`  
**What You Get:**
- NDVI proxy calculated from tree cover percentage
- Formula: `NDVI = (tree_cover / 100) * 0.7 + 0.1`
- Range: 0-1 (0 = bare soil, 1 = dense vegetation)

**Why Calculated?**
- Real NDVI requires satellite imagery (Sentinel/Landsat)
- Tree cover % is a good proxy for vegetation health
- Saves API costs while providing useful estimates

**Example:**
```javascript
// CALCULATED from tree cover:
{
  forest_cover: 42.3,  // ← REAL from GFW
  ndvi: 0.40           // ← CALCULATED: (42.3/100)*0.7+0.1
}
```

**To Get REAL NDVI:**
- Add Sentinel Hub credentials
- Requires: `SENTINELHUB_CLIENT_ID` + `SENTINELHUB_CLIENT_SECRET`
- Will fetch actual satellite NDVI values

---

#### 5. 🌲 Forest Cover
**Status:** ✅ REAL (with key) / ⚠️ SIMULATED (without key)  
**Source:** Global Forest Watch Tree Cover Density API  
**API Key Required:** YES - `GFW_API_KEY`  
**What You Get (REAL):**
- Actual tree cover percentage from 30m resolution satellite data
- Based on Landsat imagery
- Year 2000 baseline with updates

**What You Get (SIMULATED):**
- Latitude-based estimates
- Tropical regions get higher values
- Random but realistic percentages

**Example:**
```javascript
// WITH GFW_API_KEY (REAL):
{
  forest_cover: 42.3  // ← Real satellite measurement
}

// WITHOUT KEY (SIMULATED):
{
  forest_cover: 38.5  // ← Estimated from latitude + random
}
```

---

#### 6. 💨 Carbon Tracking
**Status:** ⚠️ CALCULATED (From Forest Cover)  
**Source:** Biomass estimation formulas  
**API Key Required:** No (uses forest cover data)  
**What You Get:**
- Estimated carbon stock based on forest cover
- Annual sequestration calculations
- Uses scientific formulas for biomass

**Calculation Method:**
```javascript
// Tropical forests (lat < 23.5°):
biomass_per_hectare = 200 tons C/ha

// Temperate forests (lat >= 23.5°):
biomass_per_hectare = 100 tons C/ha

// Annual sequestration:
sequestration = forested_area * 3.5 tons C/ha/year
```

**Example:**
```javascript
// CALCULATED:
{
  current_stock: 8450,        // ← Estimated from forest cover
  annual_sequestration: 148.5 // ← Calculated growth rate
}
```

**Why Calculated?**
- Real carbon measurements require field surveys
- Satellite-based estimates are expensive
- Formula-based estimates are scientifically valid

---

#### 7. 🦋 Species Recommendations
**Status:** ✅ REAL (with fallback) / ⚠️ REGIONAL DATABASE (fallback)  
**Source:** GBIF (Global Biodiversity Information Facility)  
**API Key Required:** NO - FREE Public API  
**What You Get (REAL):**
- Actual plant species observed in 50km radius
- Real scientific names from biodiversity database
- Based on human observations and specimens

**What You Get (FALLBACK):**
- Regional species database
- Curated lists for tropical/temperate zones
- Still scientifically accurate species

**Example:**
```javascript
// REAL DATA (from GBIF):
{
  pioneers: [
    "Leucaena leucocephala",    // ← Real observation
    "Gliricidia sepium",         // ← Real observation
    "Acacia auriculiformis"      // ← Real observation
  ],
  secondary: [...],
  climax: [...]
}

// FALLBACK (regional database):
{
  pioneers: [
    "Leucaena leucocephala",    // ← Curated for region
    "Gliricidia sepium",         // ← Known tropical species
    "Acacia auriculiformis"      // ← Common pioneer
  ]
}
```

---

#### 8. 🔥 Drought Index
**Status:** ⚠️ CALCULATED (Multi-factor)  
**Source:** Computed from multiple data sources  
**API Key Required:** No (uses other data)  
**What You Get:**
- Drought risk score (0-100)
- Based on 5 factors with scientific weights

**Calculation Formula:**
```javascript
drought_index = 
  precipitation_deficit * 30% +
  temperature_stress * 20% +
  humidity_deficit * 20% +
  soil_water_capacity * 15% +
  vegetation_stress * 15%
```

**Factors:**
1. **Precipitation Deficit** (30%) - From weather data
2. **Temperature Stress** (20%) - Deviation from optimal
3. **Humidity Deficit** (20%) - From weather data
4. **Soil Water Capacity** (15%) - From soil clay content
5. **Vegetation Stress** (15%) - From NDVI

**Example:**
```javascript
// CALCULATED:
{
  drought_index: 35  // ← 0-30: Low risk
                     // ← 31-60: Moderate risk
                     // ← 61-100: High risk
}
```

**Data Quality:** GOOD - Uses real inputs (weather, soil, NDVI)

---

#### 9. 📍 Restoration Zones
**Status:** ⚠️ GENERATED (Algorithm-based)  
**Source:** Computational algorithm  
**API Key Required:** No  
**What You Get:**
- 8 zones around search point
- Priority levels (high/medium/low)
- Species recommendations per zone
- Health scores

**Generation Method:**
```javascript
// Algorithm:
1. Create 8 points in circle around center (5km radius)
2. Vary health score ±20 from base score
3. Assign priority based on health:
   - health < 40: HIGH priority (needs urgent restoration)
   - health 40-70: MEDIUM priority
   - health > 70: LOW priority (maintenance)
4. Recommend species based on priority
```

**Example:**
```javascript
// GENERATED:
{
  restoration_zones: [
    {
      lat: 19.0812,              // ← Generated coordinate
      lon: 72.8923,              // ← Generated coordinate
      health_score: 68,          // ← Calculated from base
      priority: "medium",        // ← Based on health score
      recommended_species: [     // ← Selected from species list
        "Leucaena leucocephala",
        "Gliricidia sepium"
      ]
    }
  ]
}
```

**Why Generated?**
- Real restoration site analysis requires field surveys
- Provides useful planning starting points
- Can be refined with local knowledge

---

## 📊 Summary Table

| Data Source | Status | API Key Required | Data Quality |
|------------|--------|------------------|--------------|
| **Geocoding** | ✅ REAL | No (Nominatim) | HIGH |
| **Weather** | ✅ REAL / ⚠️ SIMULATED | Yes (OpenWeather) | HIGH (with key) |
| **Soil** | ✅ REAL | No (FREE) | HIGH |
| **NDVI** | ⚠️ CALCULATED | Optional (GFW) | MEDIUM |
| **Forest Cover** | ✅ REAL / ⚠️ SIMULATED | Yes (GFW) | HIGH (with key) |
| **Carbon** | ⚠️ CALCULATED | No | MEDIUM |
| **Species** | ✅ REAL / ⚠️ FALLBACK | No (FREE) | HIGH |
| **Drought Index** | ⚠️ CALCULATED | No | GOOD |
| **Restoration Zones** | ⚠️ GENERATED | No | PLANNING TOOL |

---

## 🔑 API Keys Impact

### With NO API Keys
```
✅ Geocoding: REAL (Nominatim)
⚠️ Weather: SIMULATED
✅ Soil: REAL (SoilGrids)
⚠️ NDVI: CALCULATED (proxy)
⚠️ Forest Cover: SIMULATED
⚠️ Carbon: CALCULATED
✅ Species: REAL (GBIF) or FALLBACK
⚠️ Drought Index: CALCULATED
⚠️ Zones: GENERATED
```

### With OPENWEATHER_API_KEY Only
```
✅ Geocoding: REAL
✅ Weather: REAL ← Improved!
✅ Soil: REAL
⚠️ NDVI: CALCULATED
⚠️ Forest Cover: SIMULATED
⚠️ Carbon: CALCULATED
✅ Species: REAL
⚠️ Drought Index: CALCULATED (better inputs)
⚠️ Zones: GENERATED
```

### With ALL API Keys
```
✅ Geocoding: REAL (Mapbox)
✅ Weather: REAL
✅ Soil: REAL
✅ NDVI: REAL (Sentinel Hub) ← Improved!
✅ Forest Cover: REAL (GFW) ← Improved!
⚠️ Carbon: CALCULATED (better inputs)
✅ Species: REAL
⚠️ Drought Index: CALCULATED (best inputs)
⚠️ Zones: GENERATED
```

---

## 🎯 Recommendations

### For Testing/Development
**Minimum:** No API keys needed
- Use simulated data
- Fast and free
- Good for UI development

### For Production (Basic)
**Recommended:** `OPENWEATHER_API_KEY`
- Real weather data
- Better drought calculations
- Still mostly free

### For Production (Full)
**Recommended:** All keys
```env
OPENWEATHER_API_KEY=xxx
GFW_API_KEY=xxx
MAPBOX_ACCESS_TOKEN=xxx
SENTINELHUB_CLIENT_ID=xxx
SENTINELHUB_CLIENT_SECRET=xxx
```
- Maximum real data
- Best accuracy
- Professional quality

---

## 💡 Key Insights

### Always Real (FREE)
1. ✅ **Soil Data** - SoilGrids (no key needed)
2. ✅ **Geocoding** - Nominatim (no key needed)
3. ✅ **Species** - GBIF (no key needed)

### Real with Keys
1. ✅ **Weather** - OpenWeatherMap (free tier: 1K calls/day)
2. ✅ **Forest Cover** - GFW (free tier available)
3. ✅ **NDVI** - Sentinel Hub (free tier: 30K requests/month)

### Always Calculated
1. ⚠️ **Carbon** - Formula-based (scientifically valid)
2. ⚠️ **Drought Index** - Multi-factor calculation
3. ⚠️ **Restoration Zones** - Algorithm-generated

---

## 🚀 Getting Real Data

### Step 1: Add OpenWeather Key (5 minutes)
```bash
# Sign up: https://openweathermap.org/api
echo "OPENWEATHER_API_KEY=your_key" >> .env.local
```
**Impact:** Real weather data → Better drought calculations

### Step 2: Add GFW Key (10 minutes)
```bash
# Register: https://www.globalforestwatch.org/
echo "GFW_API_KEY=your_key" >> .env.local
```
**Impact:** Real forest cover → Better NDVI proxy → Better carbon estimates

### Step 3: Add Sentinel Hub (15 minutes)
```bash
# Register: https://www.sentinel-hub.com/
echo "SENTINELHUB_CLIENT_ID=your_id" >> .env.local
echo "SENTINELHUB_CLIENT_SECRET=your_secret" >> .env.local
```
**Impact:** Real NDVI from satellites → Best vegetation analysis

---

## ✅ Conclusion

**Your implementation is SMART:**
- Uses REAL data where available (soil, species, geocoding)
- Falls back to SIMULATED data gracefully
- CALCULATES useful metrics from real inputs
- GENERATES planning tools algorithmically

**Data Quality:**
- 🟢 HIGH: Soil, Geocoding, Species (always real)
- 🟡 MEDIUM: Weather, Forest Cover (real with keys)
- 🟠 CALCULATED: NDVI, Carbon, Drought (scientifically valid)
- 🔵 GENERATED: Restoration Zones (planning tool)

**Bottom Line:** Even without API keys, you get 3 real data sources (soil, geocoding, species) and scientifically valid calculations. With API keys, you get 6+ real data sources for production-quality results.
