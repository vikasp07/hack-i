/**
 * Real-Time Forest Restoration API Endpoint
 * Main endpoint for fetching comprehensive restoration data
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRestorationData } from '@/lib/services/dataService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/restoration
 * 
 * Query Parameters:
 * - location: string (e.g., "Mumbai, India")
 * - lat: number (latitude)
 * - lon: number (longitude)
 * 
 * Either location OR (lat + lon) must be provided
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    
    // Validate input
    if (!location && (!latParam || !lonParam)) {
      return NextResponse.json(
        {
          error: 'Missing parameters',
          message: 'Either "location" or both "lat" and "lon" must be provided'
        },
        { status: 400 }
      );
    }
    
    // Parse coordinates if provided
    let lat: number | undefined;
    let lon: number | undefined;
    
    if (latParam && lonParam) {
      lat = parseFloat(latParam);
      lon = parseFloat(lonParam);
      
      if (isNaN(lat) || isNaN(lon)) {
        return NextResponse.json(
          {
            error: 'Invalid coordinates',
            message: 'lat and lon must be valid numbers'
          },
          { status: 400 }
        );
      }
      
      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return NextResponse.json(
          {
            error: 'Invalid coordinate range',
            message: 'lat must be between -90 and 90, lon must be between -180 and 180'
          },
          { status: 400 }
        );
      }
    }
    
    // Fetch restoration data
    const data = await fetchRestorationData(location || undefined, lat, lon);
    
    // Return successful response
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        data
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      }
    );
  } catch (error) {
    console.error('Restoration API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch restoration data',
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/restoration
 * 
 * Request Body:
 * {
 *   "location": "Mumbai, India" // OR
 *   "lat": 19.076,
 *   "lon": 72.878
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, lat, lon } = body;
    
    // Validate input
    if (!location && (lat === undefined || lon === undefined)) {
      return NextResponse.json(
        {
          error: 'Missing parameters',
          message: 'Either "location" or both "lat" and "lon" must be provided'
        },
        { status: 400 }
      );
    }
    
    // Validate coordinates if provided
    if (lat !== undefined && lon !== undefined) {
      if (typeof lat !== 'number' || typeof lon !== 'number') {
        return NextResponse.json(
          {
            error: 'Invalid coordinates',
            message: 'lat and lon must be numbers'
          },
          { status: 400 }
        );
      }
      
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return NextResponse.json(
          {
            error: 'Invalid coordinate range',
            message: 'lat must be between -90 and 90, lon must be between -180 and 180'
          },
          { status: 400 }
        );
      }
    }
    
    // Fetch restoration data
    const data = await fetchRestorationData(location, lat, lon);
    
    // Return successful response
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Restoration API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch restoration data',
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
