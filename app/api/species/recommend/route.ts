import { NextRequest, NextResponse } from 'next/server'
import { fetchWeatherData, fetchSoilData, getSpeciesRecommendations } from '@/lib/gis-tools'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lng, soilPh, temperature, rainfall } = body

    // If external backend URL is configured, proxy the request
    if (BACKEND_URL) {
      const response = await fetch(`${BACKEND_URL}/api/species/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, soilPh, temperature, rainfall }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Get environmental data if not provided
    let climate = { temperature, humidity: 65, rainfall }
    let soil = { ph: soilPh, nitrogen: 150, organicMatter: 3 }

    if (!temperature || !rainfall || !soilPh) {
      const [weatherData, soilData] = await Promise.all([
        fetchWeatherData(lat || 19.076, lng || 72.878),
        fetchSoilData(lat || 19.076, lng || 72.878),
      ])

      climate = {
        temperature: temperature || weatherData.temperature,
        humidity: weatherData.humidity,
        rainfall: rainfall || weatherData.rainfall,
      }

      soil = {
        ph: soilPh || soilData.ph,
        nitrogen: soilData.nitrogen,
        organicMatter: soilData.organicMatter,
      }
    }

    // Get recommendations
    const recommendations = await getSpeciesRecommendations(climate, soil, 70)

    // Format response
    const species = recommendations.map((r) => ({
      name: r.name,
      type: 'Native' as const,
      suitability: r.suitability,
      waterRequirement: r.waterRequirement as 'Low' | 'Medium' | 'High',
      carbonCapture: r.carbonCapture,
      description: r.notes,
      droughtTolerance: r.droughtTolerance,
      mineralSensitivity: 100 - r.droughtTolerance,
    }))

    return NextResponse.json({ species })
  } catch (error) {
    console.error('Species recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to get species recommendations' },
      { status: 500 }
    )
  }
}
