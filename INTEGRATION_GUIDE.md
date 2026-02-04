# 🚀 Restoration API Integration Guide

## Quick Start

### 1. Install Dependencies (Already Done)
All required dependencies are already installed in your project.

### 2. Set Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Add your API keys:
```env
OPENWEATHER_API_KEY=your_key_here
GFW_API_KEY=your_key_here  # Optional
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test the API
```bash
# Test in browser
http://localhost:3000/api/restoration?lat=19.076&lon=72.878

# Or use the test script
node test-restoration-api.js
```

## 📁 File Structure

```
habitat-dashboard/
├── app/
│   └── api/
│       └── restoration/
│           └── route.ts              ← Main API endpoint
├── lib/
│   ├── services/
│   │   └── dataService.ts            ← All data fetching logic
│   └── types/
│       └── restoration.ts            ← TypeScript types
├── hooks/
│   └── use-restoration-data.ts       ← React hooks
├── test-restoration-api.js           ← Test script
├── RESTORATION_API.md                ← API documentation
└── INTEGRATION_GUIDE.md              ← This file
```

## 🎯 Usage Examples

### Example 1: Basic React Component

```tsx
'use client';

import { useRestorationData } from '@/hooks/use-restoration-data';

export function RestorationDashboard() {
  const { data, loading, error } = useRestorationData({
    lat: 19.076,
    lon: 72.878
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Forest Restoration Data</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Forest Cover</h3>
          <p className="text-3xl">{data.forest_cover}%</p>
        </div>
        
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">NDVI</h3>
          <p className="text-3xl">{data.ndvi.toFixed(2)}</p>
        </div>
        
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Drought Index</h3>
          <p className="text-3xl">{data.drought_index}</p>
        </div>
        
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Temperature</h3>
          <p className="text-3xl">{data.weather.temp}°C</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Recommended Species</h3>
        <div className="space-y-2">
          <div>
            <strong>Pioneers:</strong> {data.species.pioneers.join(', ')}
          </div>
          <div>
            <strong>Secondary:</strong> {data.species.secondary.join(', ')}
          </div>
          <div>
            <strong>Climax:</strong> {data.species.climax.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Map Integration with Restoration Zones

```tsx
'use client';

import { useRestorationData } from '@/hooks/use-restoration-data';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function RestorationMap({ lat, lon }: { lat: number; lon: number }) {
  const { data, loading } = useRestorationData({ lat, lon });

  if (loading || !data) return <div>Loading map...</div>;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={11}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Main location marker */}
      <Marker position={[lat, lon]}>
        <Popup>
          <div>
            <strong>Search Location</strong>
            <p>Forest Cover: {data.forest_cover}%</p>
            <p>NDVI: {data.ndvi.toFixed(2)}</p>
          </div>
        </Popup>
      </Marker>

      {/* Restoration zones */}
      {data.restoration_zones.map((zone, index) => (
        <Circle
          key={index}
          center={[zone.lat, zone.lon]}
          radius={500}
          pathOptions={{
            color: getPriorityColor(zone.priority),
            fillColor: getPriorityColor(zone.priority),
            fillOpacity: 0.3
          }}
        >
          <Popup>
            <div>
              <strong>Zone {index + 1}</strong>
              <p>Priority: {zone.priority}</p>
              <p>Health Score: {zone.health_score}</p>
              <p>Species: {zone.recommended_species.join(', ')}</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
```

### Example 3: Drought Monitor Component

```tsx
'use client';

import { useDroughtMonitor } from '@/hooks/use-restoration-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function DroughtMonitor({ lat, lon }: { lat: number; lon: number }) {
  const { droughtIndex, trend, history } = useDroughtMonitor(lat, lon, 3600000); // Check every hour

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getDroughtLevel = (index: number) => {
    if (index < 30) return { level: 'Low', color: 'bg-green-500' };
    if (index < 60) return { level: 'Moderate', color: 'bg-yellow-500' };
    return { level: 'High', color: 'bg-red-500' };
  };

  if (droughtIndex === null) return <div>Loading drought data...</div>;

  const { level, color } = getDroughtLevel(droughtIndex);

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Drought Monitor</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Current Drought Index</span>
          <span className={`font-semibold ${getTrendColor()}`}>
            {trend === 'increasing' ? '↑' : trend === 'decreasing' ? '↓' : '→'} {trend}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{droughtIndex}</div>
          <div className={`px-3 py-1 rounded text-white ${color}`}>
            {level} Risk
          </div>
        </div>
        
        <div className="mt-2 h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className={`h-full ${color}`}
            style={{ width: `${droughtIndex}%` }}
          />
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">History</h3>
          <LineChart width={500} height={200} data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Location Search Component

```tsx
'use client';

import { useState } from 'react';
import { useRestorationDataPost } from '@/hooks/use-restoration-data';

export function LocationSearch() {
  const [location, setLocation] = useState('');
  const { data, loading, error, fetchData } = useRestorationDataPost();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      await fetchData({ location });
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., Mumbai, India)"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Location</h3>
            <p>Coordinates: {data.coordinates.lat}, {data.coordinates.lon}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow">
              <h4 className="text-sm text-gray-600">Forest Cover</h4>
              <p className="text-2xl font-bold">{data.forest_cover}%</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h4 className="text-sm text-gray-600">NDVI</h4>
              <p className="text-2xl font-bold">{data.ndvi.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h4 className="text-sm text-gray-600">Drought Risk</h4>
              <p className="text-2xl font-bold">{data.drought_index}</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <h4 className="font-semibold mb-2">Carbon Storage</h4>
            <p>Current Stock: {data.carbon.current_stock.toLocaleString()} tons</p>
            <p>Annual Sequestration: {data.carbon.annual_sequestration} tons/year</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Example 5: Server Component (Next.js App Router)

```tsx
import { fetchRestorationData } from '@/lib/services/dataService';

export default async function RestorationPage({
  searchParams
}: {
  searchParams: { lat?: string; lon?: string; location?: string }
}) {
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : undefined;
  const lon = searchParams.lon ? parseFloat(searchParams.lon) : undefined;
  const location = searchParams.location;

  if (!location && (!lat || !lon)) {
    return (
      <div className="p-6">
        <h1>Please provide location or coordinates</h1>
      </div>
    );
  }

  const data = await fetchRestorationData(location, lat, lon);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Restoration Analysis</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Environmental Data</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-gray-600">Temperature</dt>
              <dd className="text-2xl font-bold">{data.weather.temp}°C</dd>
            </div>
            <div>
              <dt className="text-gray-600">Humidity</dt>
              <dd className="text-2xl font-bold">{data.weather.humidity}%</dd>
            </div>
            <div>
              <dt className="text-gray-600">Rainfall</dt>
              <dd className="text-2xl font-bold">{data.weather.rainfall}mm</dd>
            </div>
          </dl>
        </div>

        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Soil Composition</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-gray-600">pH Level</dt>
              <dd className="text-2xl font-bold">{data.soil.pH}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Organic Carbon</dt>
              <dd className="text-2xl font-bold">{data.soil.organic_carbon}g/kg</dd>
            </div>
            <div>
              <dt className="text-gray-600">Nitrogen</dt>
              <dd className="text-2xl font-bold">{data.soil.nitrogen}g/kg</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Restoration Zones</h2>
        <div className="grid grid-cols-3 gap-4">
          {data.restoration_zones.map((zone, index) => (
            <div
              key={index}
              className={`p-4 rounded ${
                zone.priority === 'high'
                  ? 'bg-red-100'
                  : zone.priority === 'medium'
                  ? 'bg-yellow-100'
                  : 'bg-green-100'
              }`}
            >
              <h3 className="font-semibold">Zone {index + 1}</h3>
              <p className="text-sm">Priority: {zone.priority}</p>
              <p className="text-sm">Health: {zone.health_score}</p>
              <p className="text-xs mt-2">
                {zone.recommended_species.slice(0, 2).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Advanced Usage

### Custom Data Fetching

```typescript
import { fetchRestorationData } from '@/lib/services/dataService';

// In any server-side function
async function analyzeLocation(lat: number, lon: number) {
  const data = await fetchRestorationData(undefined, lat, lon);
  
  // Custom analysis
  const isHighRisk = data.drought_index > 60;
  const needsIntervention = data.forest_cover < 30;
  
  return {
    ...data,
    recommendations: {
      urgent: isHighRisk || needsIntervention,
      actions: isHighRisk ? ['Implement irrigation'] : ['Monitor regularly']
    }
  };
}
```

### Caching Strategy

```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 hour

export async function getCachedRestorationData(lat: number, lon: number) {
  const key = `${lat},${lon}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchRestorationData(undefined, lat, lon);
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
}
```

## 🎨 Styling Examples

### Tailwind CSS Classes

```tsx
// Priority badge
<span className={`px-2 py-1 rounded text-white ${
  priority === 'high' ? 'bg-red-500' :
  priority === 'medium' ? 'bg-yellow-500' :
  'bg-green-500'
}`}>
  {priority}
</span>

// Health score bar
<div className="w-full bg-gray-200 rounded h-4">
  <div
    className={`h-full rounded ${
      healthScore > 70 ? 'bg-green-500' :
      healthScore > 40 ? 'bg-yellow-500' :
      'bg-red-500'
    }`}
    style={{ width: `${healthScore}%` }}
  />
</div>
```

## 📊 Data Visualization

### Chart.js Integration

```tsx
import { Line } from 'react-chartjs-2';

export function NDVITrendChart({ data }: { data: RestorationData }) {
  const chartData = {
    labels: ['Current', 'Projected +1mo', 'Projected +3mo', 'Projected +6mo'],
    datasets: [{
      label: 'NDVI',
      data: [
        data.ndvi,
        data.ndvi + 0.05,
        data.ndvi + 0.12,
        data.ndvi + 0.20
      ],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return <Line data={chartData} />;
}
```

## 🚀 Deployment

### Environment Variables in Production

```bash
# Vercel
vercel env add OPENWEATHER_API_KEY
vercel env add GFW_API_KEY

# Netlify
netlify env:set OPENWEATHER_API_KEY your_key_here

# Docker
docker run -e OPENWEATHER_API_KEY=your_key_here ...
```

## 📝 Best Practices

1. **Error Handling**: Always handle loading and error states
2. **Caching**: Implement caching for frequently accessed locations
3. **Rate Limiting**: Respect API rate limits
4. **Fallbacks**: App works with mock data if APIs fail
5. **Type Safety**: Use TypeScript types for all data

## 🎉 You're Ready!

Your Restoration API is fully integrated and ready to use. Start building amazing forest restoration features!
