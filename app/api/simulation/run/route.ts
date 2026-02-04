import { NextRequest, NextResponse } from 'next/server'
import type { CalamityScenario, SimulationResult } from '@/lib/types'

const BACKEND_URL = process.env.BACKEND_URL

// Species database with calamity sensitivities
const speciesData: Record<string, {
  droughtSensitivity: number
  floodSensitivity: number
  heatSensitivity: number
  frostSensitivity: number
  pestSensitivity: number
  mineralDependency: number
  recoveryRate: number
}> = {
  'Neem': { droughtSensitivity: 0.1, floodSensitivity: 0.4, heatSensitivity: 0.15, frostSensitivity: 0.7, pestSensitivity: 0.1, mineralDependency: 0.2, recoveryRate: 0.8 },
  'Banyan': { droughtSensitivity: 0.35, floodSensitivity: 0.3, heatSensitivity: 0.25, frostSensitivity: 0.6, pestSensitivity: 0.2, mineralDependency: 0.35, recoveryRate: 0.6 },
  'Teak': { droughtSensitivity: 0.6, floodSensitivity: 0.5, heatSensitivity: 0.4, frostSensitivity: 0.5, pestSensitivity: 0.3, mineralDependency: 0.5, recoveryRate: 0.5 },
  'Mango': { droughtSensitivity: 0.45, floodSensitivity: 0.4, heatSensitivity: 0.3, frostSensitivity: 0.7, pestSensitivity: 0.4, mineralDependency: 0.4, recoveryRate: 0.55 },
  'Bamboo': { droughtSensitivity: 0.5, floodSensitivity: 0.2, heatSensitivity: 0.35, frostSensitivity: 0.8, pestSensitivity: 0.15, mineralDependency: 0.3, recoveryRate: 0.9 },
  'Jamun': { droughtSensitivity: 0.2, floodSensitivity: 0.35, heatSensitivity: 0.2, frostSensitivity: 0.65, pestSensitivity: 0.25, mineralDependency: 0.3, recoveryRate: 0.7 },
  'Eucalyptus': { droughtSensitivity: 0.3, floodSensitivity: 0.6, heatSensitivity: 0.25, frostSensitivity: 0.4, pestSensitivity: 0.35, mineralDependency: 0.45, recoveryRate: 0.75 },
  'Indian Rosewood': { droughtSensitivity: 0.25, floodSensitivity: 0.45, heatSensitivity: 0.2, frostSensitivity: 0.55, pestSensitivity: 0.3, mineralDependency: 0.35, recoveryRate: 0.65 },
  'Sal': { droughtSensitivity: 0.5, floodSensitivity: 0.35, heatSensitivity: 0.35, frostSensitivity: 0.45, pestSensitivity: 0.25, mineralDependency: 0.4, recoveryRate: 0.5 },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario, selectedSpecies, lat, lng } = body as {
      scenario: CalamityScenario
      selectedSpecies: string[]
      lat: number
      lng: number
    }

    // If external backend URL is configured, proxy the request
    if (BACKEND_URL) {
      const response = await fetch(`${BACKEND_URL}/api/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, selectedSpecies, lat, lng }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Calculate impact for each species
    const speciesImpact = selectedSpecies.map((speciesName) => {
      const data = speciesData[speciesName] || {
        droughtSensitivity: 0.4,
        floodSensitivity: 0.4,
        heatSensitivity: 0.3,
        frostSensitivity: 0.5,
        pestSensitivity: 0.3,
        mineralDependency: 0.4,
        recoveryRate: 0.6,
      }

      // Get sensitivity based on calamity type
      let baseSensitivity: number
      switch (scenario.type) {
        case 'drought':
          baseSensitivity = data.droughtSensitivity
          break
        case 'flood':
          baseSensitivity = data.floodSensitivity
          break
        case 'heat_wave':
          baseSensitivity = data.heatSensitivity
          break
        case 'frost':
          baseSensitivity = data.frostSensitivity
          break
        case 'pest_outbreak':
          baseSensitivity = data.pestSensitivity
          break
        case 'mineral_depletion':
          baseSensitivity = data.mineralDependency
          break
        default:
          baseSensitivity = 0.4
      }

      // Calculate survival and growth impact
      const severityFactor = scenario.severity / 100
      const areaFactor = scenario.affectedArea / 100
      const durationFactor = Math.min(1, scenario.duration / 12)

      const mortalityRate = baseSensitivity * severityFactor * areaFactor * (1 + durationFactor * 0.5)
      const survivalRate = Math.max(5, Math.round((1 - mortalityRate) * 100))
      const growthImpact = Math.round(Math.min(95, mortalityRate * 120))
      const recoveryTime = Math.round(scenario.duration * (1 / data.recoveryRate) * (1 + severityFactor))

      return {
        species: {
          name: speciesName,
          type: 'Native' as const,
          suitability: 75,
          waterRequirement: 'Medium' as const,
          carbonCapture: 35,
          description: '',
          droughtTolerance: Math.round((1 - data.droughtSensitivity) * 100),
          mineralSensitivity: Math.round(data.mineralDependency * 100),
        },
        survivalRate,
        growthImpact,
        recoveryTime,
      }
    })

    // Calculate overall metrics impact
    const avgSurvival = speciesImpact.reduce((sum, s) => sum + s.survivalRate, 0) / Math.max(1, speciesImpact.length)
    const severityFactor = scenario.severity / 100
    const areaFactor = scenario.affectedArea / 100

    const metricsImpact = {
      ndvi: -Math.round(severityFactor * areaFactor * 40),
      moisture: scenario.type === 'drought' ? -Math.round(severityFactor * 50) : scenario.type === 'flood' ? Math.round(severityFactor * 30) : -Math.round(severityFactor * 20),
      soilHealth: scenario.type === 'mineral_depletion' ? -Math.round(severityFactor * 60) : -Math.round(severityFactor * 20),
      carbonCapture: -Math.round((100 - avgSurvival) * 0.8),
    }

    // Generate recommendations
    const recommendations = generateRecommendations(scenario, speciesImpact)

    const result: SimulationResult = {
      scenario,
      speciesImpact,
      metricsImpact,
      recommendations,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    )
  }
}

function generateRecommendations(
  scenario: CalamityScenario,
  speciesImpact: Array<{ species: { name: string }; survivalRate: number }>
): string[] {
  const recommendations: string[] = []

  // Low survival species
  const lowSurvivalSpecies = speciesImpact.filter((s) => s.survivalRate < 50)
  if (lowSurvivalSpecies.length > 0) {
    recommendations.push(
      `Consider replacing ${lowSurvivalSpecies.map((s) => s.species.name).join(', ')} with more resilient alternatives`
    )
  }

  // Type-specific recommendations
  switch (scenario.type) {
    case 'drought':
      recommendations.push('Implement drip irrigation systems to conserve water')
      recommendations.push('Apply mulching to reduce soil moisture evaporation')
      if (scenario.severity > 60) {
        recommendations.push('Consider emergency irrigation from alternative water sources')
      }
      break
    case 'flood':
      recommendations.push('Improve drainage systems around plantation areas')
      recommendations.push('Create water channels to redirect excess water')
      break
    case 'heat_wave':
      recommendations.push('Install shade structures for vulnerable seedlings')
      recommendations.push('Increase irrigation frequency during peak heat')
      break
    case 'frost':
      recommendations.push('Use frost cloth covering for young plants')
      recommendations.push('Apply anti-transpirant sprays before frost events')
      break
    case 'pest_outbreak':
      recommendations.push('Deploy pheromone traps for early detection')
      recommendations.push('Consider biological pest control agents')
      break
    case 'mineral_depletion':
      recommendations.push('Conduct soil testing and apply targeted fertilizers')
      recommendations.push('Implement crop rotation or companion planting')
      break
  }

  // Severity-based recommendations
  if (scenario.severity > 70) {
    recommendations.push('Activate emergency response protocols')
    recommendations.push('Prepare for potential replanting in severely affected areas')
  }

  return recommendations
}
