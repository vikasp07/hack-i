# Backend Implementation Summary

## Overview

The Habitat Dashboard now has a **fully functional backend** built entirely within Next.js API routes. No external backend server is required - everything runs in the Next.js framework.

## What Changed

### 1. Removed Vercel AI SDK
**Before:**
```typescript
import { streamText, tool } from 'ai'
import { useChat } from '@ai-sdk/react'
```

**After:**
```typescript
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
```

### 2. Implemented Native AI SDKs

**OpenAI Integration:**
- Direct OpenAI SDK usage
- Function calling for tools
- Custom SSE streaming
- Full control over chat flow

**Gemini Integration:**
- Google Generative AI SDK
- Alternative to OpenAI
- Streaming support
- Free tier available

### 3. Complete Backend API Routes

All 10 API endpoints are fully implemented:

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/chat` | POST | AI chat with tool calling | ✅ Complete |
| `/api/sector/analyze` | POST | Comprehensive analysis | ✅ Complete |
| `/api/monitoring` | GET | Real-time metrics | ✅ Complete |
| `/api/weather` | GET | Weather & forecast | ✅ Complete |
| `/api/soil` | GET | Soil composition | ✅ Complete |
| `/api/satellite` | POST | NDVI/NDMI analysis | ✅ Complete |
| `/api/deforestation` | GET | Forest loss alerts | ✅ Complete |
| `/api/species/recommend` | POST | Species selection | ✅ Complete |
| `/api/simulation/run` | POST | Calamity simulation | ✅ Complete |
| `/api/predictions` | POST | Ecosystem predictions | ✅ Complete |

## Architecture

### Backend Stack
```
Next.js 16 (App Router)
├── API Routes (app/api/*)
├── GIS Tools (lib/gis-tools.ts)
├── Type Definitions (lib/types.ts)
└── AI Integration
    ├── OpenAI SDK
    └── Google Generative AI SDK
```

### Data Flow

```
User Request
    ↓
Frontend Component
    ↓
API Route (/app/api/[endpoint]/route.ts)
    ↓
GIS Tools (lib/gis-tools.ts)
    ↓
External APIs
    ├── Sentinel Hub (satellite)
    ├── OpenWeather (weather)
    ├── SoilGrids (soil)
    ├── Global Forest Watch (deforestation)
    └── OpenAI/Gemini (AI)
    ↓
Response to Frontend
```

### AI Chat Flow

```
User Message
    ↓
POST /api/chat
    ↓
OpenAI/Gemini SDK
    ↓
Function Calling (if needed)
    ├── analyzeSatellite
    ├── getWeather
    ├── checkDeforestation
    ├── analyzeSoil
    ├── recommendSpecies
    └── predictImpact
    ↓
Execute GIS Tools
    ↓
Stream Response via SSE
    ↓
Frontend displays in real-time
```

## Key Features

### 1. Tool Calling System

The AI can autonomously call 6 different tools:

```typescript
const tools = [
  {
    name: 'analyzeSatellite',
    description: 'Analyze satellite imagery using NDVI/NDMI',
    parameters: { latitude, longitude, radiusKm }
  },
  // ... 5 more tools
]
```

**How it works:**
1. User asks: "Analyze the forest at 19.076, 72.878"
2. AI decides to call `analyzeSatellite` tool
3. Backend executes `fetchSentinelData()`
4. Result streams back to AI
5. AI formulates natural language response
6. User sees both the data and explanation

### 2. GIS Integration

All GIS functionality in `lib/gis-tools.ts`:

```typescript
// Sentinel Hub - Satellite Imagery
fetchSentinelData(lat, lng, radius)
  → Returns: NDVI, NDMI, suitability scores

// OpenWeather - Climate Data
fetchWeatherData(lat, lng)
  → Returns: Temperature, humidity, forecast

// SoilGrids - Soil Analysis
fetchSoilData(lat, lng)
  → Returns: pH, NPK, organic matter

// Global Forest Watch - Deforestation
fetchDeforestationAlerts(lat, lng, radius)
  → Returns: Alerts, hotspots, trends

// Species Engine - ML-based Matching
getSpeciesRecommendations(climate, soil, score)
  → Returns: Top species with suitability scores

// Impact Calculator - Ecosystem Modeling
calculateEcosystemImpact(area, species, years)
  → Returns: Carbon, biodiversity, temperature
```

### 3. Fallback System

Every API integrates gracefully:

```typescript
try {
  // Try real API
  const data = await fetchRealData()
  return data
} catch (error) {
  // Fall back to mock data
  console.warn('Using mock data:', error)
  return generateMockData()
}
```

**Benefits:**
- App works without API keys (for testing)
- Development doesn't require paid services
- Production gets real data when available

### 4. Streaming Responses

Custom SSE implementation:

```typescript
const stream = new ReadableStream({
  async start(controller) {
    // Stream text chunks
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
    
    // Stream tool invocations
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'tool-invocation',
      toolName,
      args
    })}\n\n`))
    
    // Stream tool results
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'tool-result',
      result
    })}\n\n`))
  }
})
```

## Configuration

### Environment Variables

**Required:**
```env
OPENAI_API_KEY=sk-...           # For AI chat (Option 1)
# OR
GOOGLE_AI_API_KEY=...           # For AI chat (Option 2)
AI_PROVIDER=openai              # Choose: openai or gemini
```

**Optional (use real data):**
```env
SENTINELHUB_CLIENT_ID=...       # Satellite imagery
SENTINELHUB_CLIENT_SECRET=...   
OPENWEATHER_API_KEY=...         # Weather data
GFW_API_KEY=...                 # Deforestation alerts
```

**Optional (external backend):**
```env
BACKEND_URL=https://api.example.com  # Proxy to external backend
```

### Backend Modes

**1. Integrated Mode (Default)**
- Everything runs in Next.js
- No external backend needed
- API routes call GIS tools directly

**2. Proxy Mode**
- Set `BACKEND_URL` in `.env`
- API routes proxy to external server
- Useful for microservices architecture

## Technical Details

### Dependencies

**Added:**
- `openai@^4.77.3` - OpenAI SDK
- `@google/generative-ai@^0.21.0` - Gemini SDK

**Removed:**
- `ai@6.0.69` - Vercel AI SDK
- `@ai-sdk/react@3.0.71` - Vercel AI React hooks

### Frontend Changes

**Before (Vercel AI SDK):**
```tsx
import { useChat } from '@ai-sdk/react'

const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({ api: '/api/chat' })
})
```

**After (Custom Hook):**
```tsx
const useCustomChat = () => {
  const [messages, setMessages] = useState([])
  const sendMessage = async (text) => {
    // Custom fetch + SSE parsing
    const response = await fetch('/api/chat', { ... })
    const reader = response.body.getReader()
    // Parse SSE stream manually
  }
  return { messages, sendMessage, isStreaming }
}
```

### Performance

**Optimizations:**
- Server-side caching recommended for production
- Rate limiting for API endpoints
- Lazy loading of GIS data
- Parallel API calls where possible

**Example caching:**
```typescript
// Cache satellite data for 24 hours
const cached = await redis.get(`satellite-${lat}-${lng}`)
if (cached) return cached

const data = await fetchSentinelData(lat, lng, radius)
await redis.set(`satellite-${lat}-${lng}`, data, { ex: 86400 })
```

## Testing

### API Endpoint Tests

```bash
# Test each endpoint
pnpm test:api

# Or manually:
curl http://localhost:3000/api/weather?lat=19&lng=72
curl -X POST http://localhost:3000/api/sector/analyze \
  -d '{"lat":19,"lng":72,"radius":5}'
```

### AI Chat Test

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "parts": [{"type": "text", "text": "Analyze 19.076, 72.878"}]
    }]
  }'
```

## Deployment Considerations

### Environment Variables
- Add all API keys to deployment platform
- Use secrets management for production
- Set appropriate rate limits

### Monitoring
- Track API usage for external services
- Monitor OpenAI costs
- Log errors for debugging

### Scaling
- Consider Redis for caching
- Implement rate limiting
- Use CDN for static assets

## Migration Guide

If you have existing code using Vercel AI SDK:

1. **Update package.json:**
   ```bash
   pnpm remove ai @ai-sdk/react
   pnpm add openai @google/generative-ai
   ```

2. **Update imports:**
   - Replace `useChat` with custom hook
   - Import OpenAI/Gemini SDKs directly

3. **Update API routes:**
   - Replace `streamText()` with OpenAI SDK
   - Implement custom SSE streaming

4. **Test thoroughly:**
   - Verify all chat functionality
   - Check tool calling works
   - Ensure streaming displays correctly

## Summary

✅ **Complete backend implementation**
✅ **No Vercel AI SDK dependency**
✅ **Native OpenAI & Gemini support**
✅ **All 10 API endpoints working**
✅ **GIS tools integrated**
✅ **Streaming responses**
✅ **Tool calling system**
✅ **Fallback mock data**
✅ **Production ready**

The app is now fully functional with a robust backend built entirely in Next.js!
