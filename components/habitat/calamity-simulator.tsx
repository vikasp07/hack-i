'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Species, CalamityScenario, SimulationResult } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  CloudRain,
  Flame,
  Droplets,
  Bug,
  Snowflake,
  AlertTriangle,
  RefreshCw,
  Play,
  Leaf,
  TrendingDown,
  Clock,
} from 'lucide-react'
import { ForestLoader } from './forest-loader'

interface CalamitySimulatorProps {
  species: Species[]
  selectedSpecies: Species[]
  onSpeciesSelect: (species: Species[]) => void
}

const calamityTypes = [
  {
    type: 'drought' as const,
    label: 'Drought',
    icon: Flame,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Prolonged period of abnormally low rainfall',
  },
  {
    type: 'flood' as const,
    label: 'Flood',
    icon: CloudRain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Excessive water accumulation in soil',
  },
  {
    type: 'mineral_depletion' as const,
    label: 'Mineral Depletion',
    icon: Droplets,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    description: 'Critical reduction in soil nutrients',
  },
  {
    type: 'heat_wave' as const,
    label: 'Heat Wave',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Extended period of extreme temperatures',
  },
  {
    type: 'frost' as const,
    label: 'Frost',
    icon: Snowflake,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'Sub-zero temperatures damaging vegetation',
  },
  {
    type: 'pest_outbreak' as const,
    label: 'Pest Outbreak',
    icon: Bug,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Rapid spread of harmful insects or diseases',
  },
]

function calculateSimulationResult(
  scenario: CalamityScenario,
  selectedSpecies: Species[]
): SimulationResult {
  const speciesImpact = selectedSpecies.map((species) => {
    let survivalRate = 100
    let growthImpact = 0
    let recoveryTime = 0

    switch (scenario.type) {
      case 'drought':
        survivalRate = Math.max(
          10,
          species.droughtTolerance - scenario.severity * 0.5
        )
        growthImpact = -(100 - species.droughtTolerance) * (scenario.severity / 100)
        recoveryTime = Math.ceil((100 - species.droughtTolerance) / 10) * scenario.duration
        break
      case 'flood':
        survivalRate = Math.max(10, 80 - scenario.severity * 0.6)
        growthImpact = -scenario.severity * 0.4
        recoveryTime = Math.ceil(scenario.duration * 1.5)
        break
      case 'mineral_depletion':
        survivalRate = Math.max(
          20,
          100 - species.mineralSensitivity * (scenario.severity / 100)
        )
        growthImpact = -species.mineralSensitivity * (scenario.severity / 100)
        recoveryTime = Math.ceil(scenario.duration * 2)
        break
      case 'heat_wave':
        survivalRate = Math.max(
          15,
          species.droughtTolerance * 0.8 - scenario.severity * 0.3
        )
        growthImpact = -scenario.severity * 0.5
        recoveryTime = Math.ceil(scenario.duration * 0.8)
        break
      case 'frost':
        survivalRate = Math.max(5, 60 - scenario.severity * 0.7)
        growthImpact = -scenario.severity * 0.6
        recoveryTime = Math.ceil(scenario.duration * 2.5)
        break
      case 'pest_outbreak':
        survivalRate = Math.max(
          25,
          85 - scenario.severity * 0.5 - species.mineralSensitivity * 0.2
        )
        growthImpact = -scenario.severity * 0.35
        recoveryTime = Math.ceil(scenario.duration * 1.2)
        break
    }

    return {
      species,
      survivalRate: Math.round(survivalRate),
      growthImpact: Math.round(growthImpact),
      recoveryTime: Math.round(recoveryTime),
    }
  })

  const metricsImpact = {
    ndvi: -(scenario.severity * 0.6) / 100,
    moisture: scenario.type === 'drought' ? -(scenario.severity * 0.8) / 100 : scenario.type === 'flood' ? (scenario.severity * 0.3) / 100 : -(scenario.severity * 0.3) / 100,
    soilHealth: scenario.type === 'mineral_depletion' ? -(scenario.severity * 0.9) / 100 : -(scenario.severity * 0.4) / 100,
    carbonCapture: -(scenario.severity * 0.5) / 100,
  }

  const recommendations = generateRecommendations(scenario, speciesImpact)

  return {
    scenario,
    speciesImpact,
    metricsImpact,
    recommendations,
  }
}

function generateRecommendations(
  scenario: CalamityScenario,
  speciesImpact: SimulationResult['speciesImpact']
): string[] {
  const recommendations: string[] = []

  const highRiskSpecies = speciesImpact.filter((s) => s.survivalRate < 50)
  const lowRiskSpecies = speciesImpact.filter((s) => s.survivalRate >= 70)

  if (highRiskSpecies.length > 0) {
    recommendations.push(
      `Consider replacing ${highRiskSpecies.map((s) => s.species.name).join(', ')} with more resilient species`
    )
  }

  if (lowRiskSpecies.length > 0) {
    recommendations.push(
      `${lowRiskSpecies.map((s) => s.species.name).join(', ')} show good resilience - prioritize these species`
    )
  }

  switch (scenario.type) {
    case 'drought':
      recommendations.push('Implement drip irrigation systems')
      recommendations.push('Apply organic mulch to retain soil moisture')
      break
    case 'flood':
      recommendations.push('Improve drainage infrastructure')
      recommendations.push('Consider raised bed planting')
      break
    case 'mineral_depletion':
      recommendations.push('Apply organic fertilizers and compost')
      recommendations.push('Implement crop rotation with nitrogen-fixing plants')
      break
    case 'heat_wave':
      recommendations.push('Install shade structures for sensitive species')
      recommendations.push('Increase watering frequency during peak hours')
      break
    case 'frost':
      recommendations.push('Use frost blankets or row covers')
      recommendations.push('Plant windbreaks to reduce cold damage')
      break
    case 'pest_outbreak':
      recommendations.push('Introduce beneficial insects for biological control')
      recommendations.push('Apply organic pesticides as needed')
      break
  }

  return recommendations
}

export function CalamitySimulator({
  species,
  selectedSpecies,
  onSpeciesSelect,
}: CalamitySimulatorProps) {
  const [selectedCalamity, setSelectedCalamity] = useState<typeof calamityTypes[0] | null>(null)
  const [severity, setSeverity] = useState(50)
  const [duration, setDuration] = useState(4)
  const [affectedArea, setAffectedArea] = useState(60)
  const [isSimulating, setIsSimulating] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)

  const runSimulation = useCallback(async () => {
    if (!selectedCalamity || selectedSpecies.length === 0) return

    setIsSimulating(true)
    setResult(null)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const scenario: CalamityScenario = {
      type: selectedCalamity.type,
      severity,
      duration,
      affectedArea,
    }

    const simulationResult = calculateSimulationResult(scenario, selectedSpecies)
    setResult(simulationResult)
    setIsSimulating(false)
  }, [selectedCalamity, selectedSpecies, severity, duration, affectedArea])

  const resetSimulation = () => {
    setSelectedCalamity(null)
    setSeverity(50)
    setDuration(4)
    setAffectedArea(60)
    setResult(null)
  }

  const toggleSpecies = (s: Species) => {
    if (selectedSpecies.find((sp) => sp.name === s.name)) {
      onSpeciesSelect(selectedSpecies.filter((sp) => sp.name !== s.name))
    } else {
      onSpeciesSelect([...selectedSpecies, s])
    }
  }

  if (isSimulating) {
    return (
      <ForestLoader
        message={`Simulating ${selectedCalamity?.label} impact on ${selectedSpecies.length} species...`}
        className="min-h-[500px]"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Species Selection */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Select Species to Analyze
        </h3>
        <div className="flex flex-wrap gap-2">
          {species.map((s) => {
            const isSelected = selectedSpecies.find((sp) => sp.name === s.name)
            return (
              <button
                type="button"
                key={s.name}
                onClick={() => toggleSpecies(s)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/50 bg-card/50 text-muted-foreground hover:border-primary/50'
                )}
              >
                <Leaf className="h-4 w-4" />
                {s.name}
              </button>
            )
          })}
        </div>
        {selectedSpecies.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {selectedSpecies.length} species selected for simulation
          </p>
        )}
      </div>

      {/* Calamity Selection */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Select Calamity Type
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {calamityTypes.map((calamity) => {
            const Icon = calamity.icon
            const isSelected = selectedCalamity?.type === calamity.type
            return (
              <button
                type="button"
                key={calamity.type}
                onClick={() => setSelectedCalamity(calamity)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                  isSelected
                    ? `border-current ${calamity.color} ${calamity.bgColor}`
                    : 'border-border/50 bg-card/50 hover:border-border'
                )}
              >
                <Icon className={cn('h-6 w-6', isSelected ? '' : 'text-muted-foreground')} />
                <span className="text-xs font-medium">{calamity.label}</span>
              </button>
            )
          })}
        </div>
        {selectedCalamity && (
          <p className="mt-3 text-xs text-muted-foreground">
            {selectedCalamity.description}
          </p>
        )}
      </div>

      {/* Parameters */}
      {selectedCalamity && (
        <div className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Simulation Parameters
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Severity</span>
              <Badge variant="outline">{severity}%</Badge>
            </div>
            <Slider
              value={[severity]}
              onValueChange={(v) => setSeverity(v[0])}
              min={10}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <Badge variant="outline">{duration} weeks</Badge>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(v) => setDuration(v[0])}
              min={1}
              max={12}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Affected Area</span>
              <Badge variant="outline">{affectedArea}%</Badge>
            </div>
            <Slider
              value={[affectedArea]}
              onValueChange={(v) => setAffectedArea(v[0])}
              min={10}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={runSimulation}
              disabled={selectedSpecies.length === 0}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              Run Simulation
            </Button>
            <Button variant="outline" onClick={resetSimulation} className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Species Impact */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Species Impact Analysis
            </h3>
            <div className="space-y-3">
              {result.speciesImpact.map((impact) => (
                <div
                  key={impact.species.name}
                  className="rounded-lg border border-border/50 bg-card/50 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      {impact.species.name}
                    </span>
                    <Badge
                      variant={
                        impact.survivalRate >= 70
                          ? 'default'
                          : impact.survivalRate >= 40
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {impact.survivalRate}% Survival
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingDown className="h-3 w-3" />
                      Growth Impact: {impact.growthImpact}%
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Recovery: {impact.recoveryTime} weeks
                    </div>
                  </div>
                  {/* Survival bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        impact.survivalRate >= 70
                          ? 'bg-emerald-500'
                          : impact.survivalRate >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      )}
                      style={{ width: `${impact.survivalRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Impact */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Environmental Metrics Impact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.metricsImpact).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-border/50 bg-card/50 p-3"
                >
                  <p className="text-xs text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      value < 0 ? 'text-rose-400' : 'text-emerald-400'
                    )}
                  >
                    {value >= 0 ? '+' : ''}
                    {(value * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
