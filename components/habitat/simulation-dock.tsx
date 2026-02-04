'use client'

import { AlertTriangle, Droplets, Play, RotateCcw, Thermometer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SimulationDockProps {
  isSimulating: boolean
  droughtSeverity: number
  tempRise: number
  onSimulatingChange: (value: boolean) => void
  onDroughtChange: (value: number) => void
  onTempRiseChange: (value: number) => void
  onReset: () => void
}

export function SimulationDock({
  isSimulating,
  droughtSeverity,
  tempRise,
  onSimulatingChange,
  onDroughtChange,
  onTempRiseChange,
  onReset,
}: SimulationDockProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card/80 p-4 backdrop-blur-xl transition-all duration-300',
        isSimulating
          ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
          : 'border-border/50'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              isSimulating ? 'bg-amber-500/20' : 'bg-muted'
            )}
          >
            <AlertTriangle
              className={cn(
                'h-5 w-5 transition-colors',
                isSimulating ? 'text-amber-500' : 'text-muted-foreground'
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Risk Injection Engine
            </h3>
            <p className="text-xs text-muted-foreground">
              Simulate environmental stressors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSimulating && (
            <Badge
              variant="outline"
              className="animate-pulse border-amber-500/50 text-amber-500"
            >
              <Play className="mr-1 h-3 w-3" />
              Simulation Active
            </Badge>
          )}

          <div className="flex items-center gap-2">
            <Switch
              checked={isSimulating}
              onCheckedChange={onSimulatingChange}
              id="simulation-mode"
            />
            <Label
              htmlFor="simulation-mode"
              className="text-sm text-muted-foreground"
            >
              Enable
            </Label>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      <div
        className={cn(
          'mt-4 grid grid-cols-2 gap-6 transition-all',
          !isSimulating && 'pointer-events-none opacity-40'
        )}
      >
        {/* Drought Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-amber-500" />
              <Label className="text-sm text-foreground">Drought Severity</Label>
            </div>
            <span className="font-mono text-sm font-medium text-amber-500">
              {droughtSeverity}%
            </span>
          </div>
          <Slider
            value={[droughtSeverity]}
            onValueChange={(v) => onDroughtChange(v[0])}
            max={100}
            step={5}
            disabled={!isSimulating}
            className="[&_[data-slot=slider-range]]:bg-amber-500 [&_[data-slot=slider-thumb]]:border-amber-500"
          />
          <p className="text-xs text-muted-foreground">
            {droughtSeverity > 70
              ? 'Severe drought conditions'
              : droughtSeverity > 40
                ? 'Moderate water stress'
                : 'Normal conditions'}
          </p>
        </div>

        {/* Temperature Rise Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-500" />
              <Label className="text-sm text-foreground">Temperature Rise</Label>
            </div>
            <span className="font-mono text-sm font-medium text-rose-500">
              +{tempRise}°C
            </span>
          </div>
          <Slider
            value={[tempRise]}
            onValueChange={(v) => onTempRiseChange(v[0])}
            max={5}
            step={0.5}
            disabled={!isSimulating}
            className="[&_[data-slot=slider-range]]:bg-rose-500 [&_[data-slot=slider-thumb]]:border-rose-500"
          />
          <p className="text-xs text-muted-foreground">
            {tempRise > 3
              ? 'Extreme heat stress'
              : tempRise > 1.5
                ? 'Elevated temperatures'
                : 'Baseline temperature'}
          </p>
        </div>
      </div>

      {/* Reset Button */}
      {isSimulating && (droughtSeverity > 0 || tempRise > 0) && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Simulation
          </Button>
        </div>
      )}
    </div>
  )
}
