# 🚀 Quick Start: Restoration API

## ⚡ 3-Minute Setup

### Step 1: Environment Variables (30 seconds)

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add MINIMUM this key:
OPENWEATHER_API_KEY=your_key_here
```

**Get OpenWeather API Key (FREE):**
1. Visit: https://openweathermap.org/api
2. Sign up (free)
3. Copy API key
4. Paste into `.env.local`

### Step 2: Start Server (10 seconds)

```bash
npm run dev
```

### Step 3: Test API (30 seconds)

Open in browser:
```
http://localhost:3000/api/restoration?lat=19.076&lon=72.878
```

You should see JSON response with forest data! 🎉

## 🎯 Quick Test Locations

```bash
# Mumbai, India
http://localhost:3000/api/restoration?lat=19.076&lon=72.878

# Amazon Rainforest
http://localhost:3000/api/restoration?lat=-3.4653&lon=-62.2159

# Paris, France
http://localhost:3000/api/restoration?lat=48.8566&lon=2.3522

# Nairobi, Kenya
http://localhost:3000/api/restoration?lat=-1.2921&lon=36.8219
```

## 📱 Use in Your Components

### Option 1: React Hook (Easiest)

```tsx
'use client';

import { useRestorationData } from '@/hooks/use-restoration-data';

export function MyComponent() {
  const { data, loading, error } = useRestorationData({
    lat: 19.076,
    lon: 72.878
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Forest Cover: {data?.forest_cover}%</h1>
      <h2>NDVI: {data?.ndvi}</h2>
      <h3>Drought Index: {data?.drought_index}</h3>
    </div>
  );
}
```

### Option 2: Direct API Call

```tsx
'use client';

import { useState, useEffect } from 'react';

export function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/restoration?lat=19.076&lon=72.878')
      .then(res => res.json())
      .then(result => setData(result.data));
  }, []);

  return <div>{data?.forest_cover}%</div>;
}
```

### Option 3: Server Component

```tsx
import { fetchRestorationData } from '@/lib/services/dataService';

export default async function Page() {
  const data = await fetchRestorationData(undefined, 19.076, 72.878);
  
  return <div>Forest Cover: {data.forest_cover}%</div>;
}
```

## 🎨 What You Get

```json
{
  "coordinates": { "lat": 19.076, "lon": 72.878 },
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
    "pioneers": ["Leucaena leucocephala", "Gliricidia sepium"],
    "secondary": ["Swietenia mahagoni", "Tectona grandis"],
    "climax": ["Dipterocarpus alatus", "Shorea robusta"]
  },
  "drought_index": 35,
  "restoration_zones": [
    {
      "lat": 19.0812,
      "lon": 72.8923,
      "health_score": 68,
      "priority": "medium",
      "recommended_species": ["Leucaena leucocephala"]
    }
  ]
}
```

## 🔑 Optional API Keys (Add Later)

```env
# For real forest cover data
GFW_API_KEY=your_gfw_key_here

# For better geocoding
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# For satellite imagery
SENTINELHUB_CLIENT_ID=your_id
SENTINELHUB_CLIENT_SECRET=your_secret
```

**App works without these! Uses mock data for testing.**

## 🧪 Run Tests

```bash
node test-restoration-api.js
```

## 📚 Full Documentation

- **API Reference**: See `RESTORATION_API.md`
- **Integration Guide**: See `INTEGRATION_GUIDE.md`
- **Type Definitions**: See `lib/types/restoration.ts`

## 🆘 Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "API key invalid"
- Check `.env.local` has correct key
- Restart dev server: `npm run dev`

### "Location not found"
- Use coordinates instead of location name
- Check coordinates are valid (-90 to 90 lat, -180 to 180 lon)

## ✅ Checklist

- [ ] Added `OPENWEATHER_API_KEY` to `.env.local`
- [ ] Started dev server (`npm run dev`)
- [ ] Tested API in browser
- [ ] Tried example component code
- [ ] Read full documentation

## 🎉 Done!

You now have a fully functional real-time forest restoration data engine!

**Next Steps:**
1. Integrate into your map component
2. Add visualization charts
3. Build restoration planning features
4. Deploy to production

**Need Help?** Check the full documentation files or test with the provided examples.
