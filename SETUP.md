# Installation & Setup Instructions

## Quick Setup (3 Steps)

### 1. Install Dependencies

```bash
pnpm install
```

This will install all necessary packages including:
- OpenAI SDK (for AI chat)
- Google Generative AI SDK (alternative AI provider)
- All other dependencies

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your API keys. **Minimum required keys:**

```env
# At minimum, you need ONE of these for AI chat:
OPENAI_API_KEY=sk-...your-key-here

# These are optional but recommended for full functionality:
SENTINELHUB_CLIENT_ID=your-client-id
SENTINELHUB_CLIENT_SECRET=your-client-secret
OPENWEATHER_API_KEY=your-api-key
```

The app will work with just the OpenAI key - other services will use fallback mock data.

### 3. Run the Application

```bash
pnpm dev
```

Visit http://localhost:3000

## Detailed Setup

### Getting API Keys

#### OpenAI (Required for AI Chat)
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Paste in `.env` as `OPENAI_API_KEY=sk-...`

**Cost:** Pay as you go, ~$0.01-0.03 per conversation

#### Alternative: Google Gemini
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste in `.env` as `GOOGLE_AI_API_KEY=...`
5. Set `AI_PROVIDER=gemini` in `.env`

**Cost:** Free tier available with generous limits

#### Sentinel Hub (Optional - for real satellite data)
1. Sign up at https://www.sentinel-hub.com/
2. Go to Dashboard → OAuth Clients
3. Create new OAuth client
4. Copy Client ID and Client Secret
5. Add to `.env`:
   ```env
   SENTINELHUB_CLIENT_ID=...
   SENTINELHUB_CLIENT_SECRET=...
   ```

**Cost:** Free tier: 30,000 requests/month

#### OpenWeather (Optional - for real weather data)
1. Sign up at https://openweathermap.org/api
2. Go to API Keys section
3. Copy the default API key
4. Add to `.env`: `OPENWEATHER_API_KEY=...`

**Cost:** Free tier: 1,000 calls/day

#### Global Forest Watch (Optional - for deforestation alerts)
1. Register at https://www.globalforestwatch.org/
2. Request API access
3. Add to `.env`: `GFW_API_KEY=...`

**Note:** App works fine without this - will use mock data

## Verification

### Test the Installation

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Check if it's running:**
   - Open http://localhost:3000
   - You should see the Habitat Dashboard

3. **Test AI Chat:**
   - Click on the AI chat panel (right side)
   - Type: "Hello"
   - You should get a response from HABITAT-AI

4. **Test API endpoints:**
   ```bash
   # Test weather (should work with mock data even without API key)
   curl http://localhost:3000/api/weather?lat=19.076&lng=72.878
   
   # Test sector analysis
   curl -X POST http://localhost:3000/api/sector/analyze \
     -H "Content-Type: application/json" \
     -d '{"lat": 19.076, "lng": 72.878, "radius": 5}'
   ```

### Expected Behavior

**With only OpenAI key:**
- ✅ AI chat works
- ✅ Dashboard loads
- ✅ Map displays
- ⚠️ Satellite/weather/soil data uses mock values
- ✅ All visualizations work

**With all API keys:**
- ✅ Everything above
- ✅ Real satellite imagery analysis
- ✅ Live weather data
- ✅ Actual soil composition
- ✅ Real deforestation alerts

## Troubleshooting

### "AI chat not responding"

**Check:**
1. Is `OPENAI_API_KEY` set in `.env`?
2. Run: `cat .env | grep OPENAI_API_KEY`
3. Key should start with `sk-`
4. Check OpenAI dashboard for API quota

**Fix:**
```bash
# Make sure .env exists
ls -la .env

# Verify the key is set
echo $OPENAI_API_KEY

# Restart dev server
pnpm dev
```

### "Module not found" errors

**Fix:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm -rf .next
pnpm install
```

### "Satellite/Weather data not loading"

**This is normal!** The app works in two modes:

1. **Mock Mode** (no API keys): Uses generated data for testing
2. **Live Mode** (with API keys): Fetches real data

To enable live data, add the respective API keys to `.env`.

### Environment variables not loading

**Check:**
1. File is named exactly `.env` (not `.env.local` or `.env.txt`)
2. File is in the root directory (same folder as `package.json`)
3. No spaces around `=` in `.env` file
4. Restart dev server after adding keys

**Correct format:**
```env
OPENAI_API_KEY=sk-abc123
```

**Wrong formats:**
```env
OPENAI_API_KEY = sk-abc123  # ❌ spaces
OPENAI_API_KEY="sk-abc123" # ❌ quotes (remove them)
```

### Port 3000 already in use

**Fix:**
```bash
# Use a different port
pnpm dev -- -p 3001
```

## Development Workflow

### Recommended workflow:

1. **Start with minimum setup** (just OpenAI key)
2. **Test the app** - everything should work with mock data
3. **Add API keys gradually** as you need real data
4. **Monitor API usage** to avoid unexpected costs

### Cost Management

**Free tier limits:**
- Sentinel Hub: 30K requests/month
- OpenWeather: 1K requests/day  
- OpenAI: Pay as you go (~$0.01-0.03 per chat)
- Gemini: Free tier with 60 requests/minute

**Recommendation:** Start with Gemini (free) or OpenAI with a $5 credit limit.

## Next Steps

After setup:

1. ✅ Verify app loads at http://localhost:3000
2. ✅ Test AI chat with a simple question
3. ✅ Try analyzing a location on the map
4. 📖 Read [README.md](README.md) for full documentation
5. 📖 Check [ROUTES.md](ROUTES.md) for API details

## Production Deployment

### Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Docker

```bash
# Build
docker build -t habitat-dashboard .

# Run
docker run -p 3000:3000 --env-file .env habitat-dashboard
```

### PM2 (Self-hosted)

```bash
pnpm build
pm2 start npm --name "habitat" -- start
```

## Support

**Issues?**
1. Check this file first
2. Review [README.md](README.md)
3. Check browser console (F12) for errors
4. Check terminal for server errors

**Common Issues:**
- Missing API keys → Add to `.env`
- Wrong API key format → Check for spaces/quotes
- Module errors → Delete `node_modules`, reinstall
- Port in use → Use different port with `-p 3001`

**Still stuck?**
- Verify Node version: `node -v` (need 18+)
- Verify pnpm: `pnpm -v`
- Try: `rm -rf .next && pnpm dev`
