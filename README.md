# Habitat Adaptive Reforestation Platform - Setup Guide

This Next.js application provides a comprehensive GIS-powered reforestation planning platform with AI assistance. The backend is fully integrated into Next.js API routes with support for real-time satellite analysis, weather data, soil assessment, and AI-powered recommendations.

## Features

- **Satellite Imagery Analysis**: Real-time NDVI/NDMI analysis using Sentinel Hub
- **Weather Integration**: Live weather data and forecasts via OpenWeather API
- **Deforestation Monitoring**: Global Forest Watch integration for alert tracking
- **Soil Analysis**: SoilGrids API integration for soil composition data
- **Species Recommendations**: AI-powered species selection based on environmental data
- **Ecosystem Impact Predictions**: Calculate long-term benefits of reforestation
- **AI Chat Assistant**: Powered by OpenAI or Google Gemini for interactive guidance
- **Calamity Simulation**: Model impacts of droughts, floods, and other events

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- API keys for external services (see below)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required for Satellite Analysis
SENTINELHUB_CLIENT_ID=your_sentinel_hub_client_id
SENTINELHUB_CLIENT_SECRET=your_sentinel_hub_client_secret

# Required for Weather Data
OPENWEATHER_API_KEY=your_openweather_api_key

# Optional: For Deforestation Alerts
GFW_API_KEY=your_global_forest_watch_api_key

# Required for AI Chat (choose one)
OPENAI_API_KEY=your_openai_api_key
# OR
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Optional: Choose AI provider (default: openai)
AI_PROVIDER=openai
```

### 3. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
pnpm build
pnpm start
```

## API Keys Setup

### Sentinel Hub (Satellite Imagery)
1. Sign up at https://www.sentinel-hub.com/
2. Create an OAuth client in your dashboard
3. Copy Client ID and Client Secret to `.env`

### OpenWeather API (Weather Data)
1. Sign up at https://openweathermap.org/api
2. Generate an API key
3. Add to `.env` as `OPENWEATHER_API_KEY`

### Global Forest Watch (Deforestation Alerts)
1. Register at https://www.globalforestwatch.org/
2. Request API access
3. Add to `.env` as `GFW_API_KEY` (optional - app works with fallback data)

### OpenAI API (AI Chat)
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env` as `OPENAI_API_KEY`

### Google AI / Gemini (Alternative to OpenAI)
1. Visit https://makersuite.google.com/app/apikey
2. Create an API key
3. Add to `.env` as `GOOGLE_AI_API_KEY`
4. Set `AI_PROVIDER=gemini` in `.env`

## Architecture

### Backend Structure

The application uses Next.js API Routes for the backend:

```
app/api/
├── chat/route.ts              # AI chat endpoint with tool calling
├── sector/analyze/route.ts    # Comprehensive sector analysis
├── monitoring/route.ts        # Real-time monitoring data
├── weather/route.ts           # Weather and forecast data
├── soil/route.ts              # Soil composition analysis
├── satellite/route.ts         # Satellite imagery (NDVI/NDMI)
├── deforestation/route.ts     # Deforestation alerts
├── species/recommend/route.ts # Species recommendations
├── simulation/run/route.ts    # Calamity impact simulation
└── predictions/route.ts       # Ecosystem predictions
```

### GIS Tools (`lib/gis-tools.ts`)

All GIS functionality is implemented in server-side functions:

- `fetchSentinelData()` - Sentinel Hub satellite analysis
- `fetchWeatherData()` - OpenWeather API integration
- `fetchDeforestationAlerts()` - Global Forest Watch alerts
- `fetchSoilData()` - SoilGrids API for soil properties
- `getSpeciesRecommendations()` - ML-based species matching
- `calculateEcosystemImpact()` - Impact projection calculations

### AI Integration

**Replaced Vercel AI SDK with native OpenAI/Gemini SDKs:**

- OpenAI SDK for GPT-4o with function calling
- Google Generative AI SDK for Gemini Pro
- Custom streaming implementation for real-time responses
- Tool calling for GIS data integration

**Available AI Tools:**
- `analyzeSatellite` - Fetch NDVI/NDMI data
- `getWeather` - Current weather and forecast
- `checkDeforestation` - Forest loss alerts
- `analyzeSoil` - Soil composition
- `recommendSpecies` - Species selection
- `predictImpact` - Ecosystem impact modeling

## API Endpoints

All endpoints are documented in [ROUTES.md](ROUTES.md). Key endpoints:

### Sector Analysis
```bash
POST /api/sector/analyze
Body: { "lat": 19.076, "lng": 72.878, "radius": 5 }
```

### AI Chat
```bash
POST /api/chat
Body: { "messages": [...] }
Returns: Server-Sent Events (SSE) stream
```

### Weather Data
```bash
GET /api/weather?lat=19.076&lng=72.878
```

### Satellite Analysis
```bash
POST /api/satellite
Body: { "lat": 19.076, "lng": 72.878, "radius": 5 }
```

## Frontend Components

### Main Components

- `app/page.tsx` - Main dashboard with map and metrics
- `components/habitat/ai-chat.tsx` - AI assistant interface
- `components/habitat/map-canvas.tsx` - Interactive map with Leaflet
- `components/habitat/simulation-dock.tsx` - Calamity simulation UI
- `components/habitat/prediction-panel.tsx` - Ecosystem predictions

### UI Components

Built with Radix UI and Tailwind CSS:
- `components/ui/*` - Reusable UI components
- Full dark mode support
- Responsive design

## Development

### Adding New GIS Functions

1. Add function to `lib/gis-tools.ts`
2. Create API route in `app/api/[endpoint]/route.ts`
3. Add tool definition in `app/api/chat/route.ts` if needed
4. Update `ROUTES.md` documentation

### Testing API Endpoints

```bash
# Test sector analysis
curl -X POST http://localhost:3000/api/sector/analyze \
  -H "Content-Type: application/json" \
  -d '{"lat": 19.076, "lng": 72.878, "radius": 5}'

# Test weather
curl http://localhost:3000/api/weather?lat=19.076&lng=72.878

# Test AI chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "parts": [{"type": "text", "text": "Analyze 19.076, 72.878"}]}]}'
```

## Troubleshooting

### Satellite data returns mock data
- Verify `SENTINELHUB_CLIENT_ID` and `SENTINELHUB_CLIENT_SECRET` are correct
- Check Sentinel Hub dashboard for API quota
- Ensure coordinates are within valid range

### Weather API fails
- Verify `OPENWEATHER_API_KEY` is active
- Free tier has rate limits (60 calls/minute)
- Check OpenWeather dashboard for usage

### AI chat not responding
- Verify `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY` is set
- Check API key has sufficient credits
- Review browser console for errors
- Check server logs: `pnpm dev` output

### Build errors
- Run `pnpm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version: `node -v` (should be 18+)

## Performance Optimization

### Caching Recommendations

For production, implement caching for:
- Satellite imagery (cache for 24h)
- Weather forecasts (cache for 1h)
- Soil data (cache for 7 days)

Example with Redis:
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

// In API route
const cacheKey = `weather-${lat}-${lng}`
const cached = await redis.get(cacheKey)
if (cached) return cached

const data = await fetchWeatherData(lat, lng)
await redis.set(cacheKey, data, { ex: 3600 }) // 1 hour
```

### Rate Limiting

Implement rate limiting for API routes:
```bash
pnpm add @upstash/ratelimit
```

## Deployment

### Vercel (Recommended)

```bash
pnpm build
vercel deploy
```

Add environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted

```bash
pnpm build
pm2 start npm --name "habitat-dashboard" -- start
```

## Security

- Never commit `.env` file
- Use environment variables for all API keys
- Implement rate limiting in production
- Add CORS configuration if needed
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Review [ROUTES.md](ROUTES.md) for API documentation
- Check troubleshooting section above
- Review browser console and server logs
- Verify all environment variables are set correctly

## Changelog

### v2.0.0 (Current)
- Removed Vercel AI SDK dependency
- Implemented native OpenAI SDK integration
- Added Google Gemini support
- Custom streaming implementation
- Full backend implementation in Next.js
- Improved tool calling architecture
- Enhanced error handling

### v1.0.0
- Initial release with Vercel AI SDK
- Basic GIS tool integration
- Map visualization
- Species recommendations
