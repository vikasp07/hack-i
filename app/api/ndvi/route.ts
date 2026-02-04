/**
 * NDVI API Route
 * GET /api/ndvi?lat=<lat>&lon=<lon>&radius=<radius>
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchNDVIData } from '@/lib/services/ndvi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
    const radius = radiusParam ? parseFloat(radiusParam) : 1;

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Lat must be -90 to 90, lon must be -180 to 180' },
        { status: 400 }
      );
    }

    if (isNaN(radius) || radius < 0.1 || radius > 10) {
      return NextResponse.json(
        { error: 'Invalid radius. Must be between 0.1 and 10 km' },
        { status: 400 }
      );
    }

    const data = await fetchNDVIData(lat, lon, radius);

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
    console.error('NDVI API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NDVI data'
      },
      { status: 500 }
    );
  }
}
