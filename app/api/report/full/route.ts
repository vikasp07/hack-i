/**
 * Full Report API Route - Combined Master Endpoint
 * GET /api/report/full?lat=<lat>&lon=<lon>
 * 
 * Fetches ALL environmental data from real APIs:
 * - Weather (OpenWeatherMap)
 * - Soil (SoilGrids)
 * - Species (GBIF)
 * - Forest (Global Forest Watch)
 * - NDVI (Sentinel Hub)
 * - AI Recommendation (OpenAI/Gemini)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/services/weather';
import { fetchSoilData } from '@/lib/services/soil';
import { fetchSpeciesData } from '@/lib/services/species';
import { fetchForestData } from '@/lib/services/forest';
import { fetchNDVIData } from '@/lib/services/ndvi';
import { generateAIRecommendation } from '@/lib/services/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for all API calls

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const radiusParam = searchParams.get('radius');

    if (!latParam || !lonParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lon' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    const radius = radiusParam ? parseFloat(radiusParam) : 50;

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Lat must be -90 to 90, lon must be -180 to 180' },
        { status: 400 }
      );
    }

    console.log(`[Full Report] Fetching data for coordinates: ${lat}, ${lon}`);

    // Fetch all data in parallel for better performance
    const [weather, soil, species, forest, ndvi] = await Promise.all([
      fetchWeatherData(lat, lon).catch(err => {
        console.error('Weather fetch failed:', err.message);
        throw new Error(`Weather: ${err.message}`);
      }),
      fetchSoilData(lat, lon).catch(err => {
        console.error('Soil fetch failed:', err.message);
        throw new Error(`Soil: ${err.message}`);
      }),
      fetchSpeciesData(lat, lon, radius).catch(err => {
        console.error('Species fetch failed:', err.message);
        throw new Error(`Species: ${err.message}`);
      }),
      fetchForestData(lat, lon).catch(err => {
        console.error('Forest fetch failed:', err.message);
        throw new Error(`Forest: ${err.message}`);
      }),
      fetchNDVIData(lat, lon, 1).catch(err => {
        console.error('NDVI fetch failed:', err.message);
        throw new Error(`NDVI: ${err.message}`);
      })
    ]);

    console.log('[Full Report] All environmental data fetched successfully');

    // Generate AI recommendation based on collected data
    console.log('[Full Report] Generating AI recommendation...');
    const aiRecommendation = await generateAIRecommendation({
      weather,
      soil,
      species,
      forest,
      ndvi,
      coordinates: { lat, lon }
    }).catch(err => {
      console.error('AI recommendation failed:', err.message);
      // Don't fail the entire request if AI fails
      return {
        summary: 'AI recommendation unavailable',
        priority_actions: [],
        species_recommendations: [],
        risk_assessment: 'Unable to generate assessment',
        timeline: 'N/A',
        confidence: 0
      };
    });

    const duration = Date.now() - startTime;
    console.log(`[Full Report] Complete in ${duration}ms`);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        coordinates: { lat, lon },
        processing_time_ms: duration,
        data: {
          weather,
          soil,
          species,
          forest,
          ndvi,
          ai_recommendation: aiRecommendation
        },
        metadata: {
          sources: {
            weather: 'OpenWeatherMap',
            soil: 'SoilGrids (ISRIC)',
            species: 'GBIF',
            forest: 'Global Forest Watch',
            ndvi: 'Sentinel Hub (Sentinel-2)',
            ai: process.env.AI_PROVIDER === 'gemini' ? 'Google Gemini' : 'OpenAI GPT-4'
          },
          data_quality: 'REAL',
          fallback_used: false
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Full Report] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate full report',
        processing_time_ms: duration,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
