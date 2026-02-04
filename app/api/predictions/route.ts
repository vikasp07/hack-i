import { NextRequest, NextResponse } from 'next/server'
import { calculateEcosystemImpact } from '@/lib/gis-tools'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lng, timelineMonths = 36, selectedSpecies = [] } = body

    // If external backend URL is configured, proxy the request
    if (BACKEND_URL) {
      const response = await fetch(`${BACKEND_URL}/api/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, timelineMonths, selectedSpecies }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Generate timeline data
    const timelineData = []
    for (let month = 0; month <= timelineMonths; month++) {
      const progress = month / timelineMonths
      const maturityCurve = 1 - Math.exp(-progress * 3) // Logarithmic growth curve

      timelineData.push({
        month,
        waterRetention: Math.round(10 + maturityCurve * 45),
        aqiImprovement: Math.round(5 + maturityCurve * 35),
        temperatureReduction: parseFloat((0.2 + maturityCurve * 2.5).toFixed(1)),
        carbonSequestration: Math.round(maturityCurve * 150 * (month / 12)),
        treeMaturity: Math.round(maturityCurve * 100),
      })
    }

    // Calculate ecosystem impact
    const impact = await calculateEcosystemImpact(
      100, // Assumed area in hectares
      selectedSpecies,
      timelineMonths / 12
    )

    // Generate predictions
    const predictions = [
      {
        timeframe: '1 Month',
        ndviPrediction: 0.35 + Math.random() * 0.1,
        confidenceInterval: [0.30, 0.42] as [number, number],
        riskFactors: [
          { factor: 'Water Stress', probability: 0.3, impact: 'medium' as const },
          { factor: 'Initial Mortality', probability: 0.15, impact: 'low' as const },
        ],
        optimalActions: ['Ensure adequate irrigation', 'Apply mulch for moisture retention'],
      },
      {
        timeframe: '3 Months',
        ndviPrediction: 0.45 + Math.random() * 0.1,
        confidenceInterval: [0.38, 0.55] as [number, number],
        riskFactors: [
          { factor: 'Pest Infestation', probability: 0.2, impact: 'medium' as const },
          { factor: 'Nutrient Deficiency', probability: 0.25, impact: 'medium' as const },
        ],
        optimalActions: ['Monitor for pest activity', 'Apply fertilizer if needed'],
      },
      {
        timeframe: '6 Months',
        ndviPrediction: 0.55 + Math.random() * 0.1,
        confidenceInterval: [0.48, 0.65] as [number, number],
        riskFactors: [
          { factor: 'Drought Risk', probability: 0.35, impact: 'high' as const },
          { factor: 'Competition', probability: 0.2, impact: 'low' as const },
        ],
        optimalActions: ['Prepare drought contingency', 'Thinning if overcrowded'],
      },
    ]

    // Ecosystem benefits breakdown
    const ecosystemBenefits = [
      { category: 'Carbon Capture', value: impact.carbonSequestration, percentage: 35 },
      { category: 'Biodiversity', value: impact.biodiversityScore, percentage: 25 },
      { category: 'Soil Health', value: 75, percentage: 20 },
      { category: 'Water Cycle', value: impact.waterRetention, percentage: 20 },
    ]

    return NextResponse.json({
      predictions,
      timelineData,
      ecosystemBenefits,
    })
  } catch (error) {
    console.error('Predictions error:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}
