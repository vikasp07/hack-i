/**
 * Forest API Route
 * GET /api/forest?lat=<lat>&lon=<lon>
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchForestData } from '@/lib/services/forest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');

    if (!latParam || !lonParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lon' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Lat must be -90 to 90, lon must be -180 to 180' },
        { status: 400 }
      );
    }

    const data = await fetchForestData(lat, lon);

    return NextResponse.json(
      {
        success: true,
        data
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800'
        }
      }
    );
  } catch (error) {
    console.error('Forest API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch forest data'
      },
      { status: 500 }
    );
  }
}
