import { NextRequest, NextResponse } from 'next/server'
import { fetchSentinelData } from '@/lib/gis-tools'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lng, radius } = body

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // If external backend URL is configured, proxy the request
    if (BACKEND_URL) {
      const response = await fetch(`${BACKEND_URL}/api/satellite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, radius }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Use internal GIS tools
    const satelliteData = await fetchSentinelData(lat, lng, radius || 5)
    return NextResponse.json(satelliteData)
  } catch (error) {
    console.error('Satellite API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch satellite data' },
      { status: 500 }
    )
  }
}
