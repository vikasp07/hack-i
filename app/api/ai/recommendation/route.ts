/**
 * AI Recommendation API Route
 * POST /api/ai/recommendation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAIRecommendation } from '@/lib/services/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { weather, soil, species, forest, ndvi, coordinates } = body;

    if (!weather || !soil || !species || !forest || !ndvi || !coordinates) {
      return NextResponse.json(
        { error: 'Missing required data fields: weather, soil, species, forest, ndvi, coordinates' },
        { status: 400 }
      );
    }

    const recommendation = await generateAIRecommendation({
      weather,
      soil,
      species,
      forest,
      ndvi,
      coordinates
    });

    return NextResponse.json(
      {
        success: true,
        data: recommendation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('AI Recommendation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate AI recommendation'
      },
      { status: 500 }
    );
  }
}
