'use client'

import { Droplets, Leaf, TreeDeciduous } from 'lucide-react'
import type { Species } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface SpeciesListProps {
  species: Species[]
  isLoading?: boolean
  droughtSeverity?: number
}

export function SpeciesList({
  species,
  isLoading,
  droughtSeverity = 0,
}: SpeciesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const isGrayedOut = (waterReq: string) => {
    if (droughtSeverity > 50 && waterReq === 'High') return true
    if (droughtSeverity > 70 && waterReq === 'Medium') return true
    return false
  }

  const waterReqColors = {
    Low: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    High: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
  }

  return (
    <ScrollArea className="h-[320px] pr-4">
      <div className="space-y-3">
        {species.map((sp) => {
          const grayedOut = isGrayedOut(sp.waterRequirement)

          return (
            <div
              key={sp.name}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-4 transition-all',
                grayedOut
                  ? 'opacity-40 grayscale'
                  : 'hover:border-primary/30 hover:bg-card/50'
              )}
            >
              {/* Drought warning overlay */}
              {grayedOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Badge
                    variant="destructive"
                    className="animate-pulse text-xs"
                  >
                    Not suitable during drought
                  </Badge>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TreeDeciduous className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{sp.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        {sp.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', waterReqColors[sp.waterRequirement])}
                      >
                        <Droplets className="mr-1 h-3 w-3" />
                        {sp.waterRequirement}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-lg font-bold text-emerald-500">
                    {sp.suitability}%
                  </span>
                  <p className="text-xs text-muted-foreground">Suitability</p>
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {sp.description}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Leaf className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  CO₂ Capture:
                </span>
                <span className="font-mono text-xs font-medium text-foreground">
                  {sp.carbonCapture} kg/year
                </span>
                <Progress
                  value={(sp.carbonCapture / 60) * 100}
                  className="ml-auto h-1.5 w-20"
                />
              </div>

              {/* Tolerance indicators */}
              {sp.droughtTolerance !== undefined && (
                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Drought Tolerance</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            sp.droughtTolerance >= 70 ? 'bg-emerald-500' : sp.droughtTolerance >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                          )}
                          style={{ width: `${sp.droughtTolerance}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{sp.droughtTolerance}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mineral Sensitivity</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            sp.mineralSensitivity <= 30 ? 'bg-emerald-500' : sp.mineralSensitivity <= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          )}
                          style={{ width: `${sp.mineralSensitivity}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono">{sp.mineralSensitivity}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
