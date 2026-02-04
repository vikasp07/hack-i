import { NextRequest, NextResponse } from 'next/server'
import { fetchWeatherData } from '@/lib/gis-tools'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '19.076')
    const lng = parseFloat(searchParams.get('lng') || '72.878')

    // If external backend URL is configured, proxy the request
    if (BACKEND_URL) {
      const response = await fetch(
        `${BACKEND_URL}/api/weather?lat=${lat}&lng=${lng}`
      )

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Use internal GIS tools
    const weatherData = await fetchWeatherData(lat, lng)
    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
