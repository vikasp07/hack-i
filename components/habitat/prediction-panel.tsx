'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { PredictionData } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Wind,
  Thermometer,
  TreeDeciduous,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface PredictionPanelProps {
  predictions: PredictionData[] | null
  timelineData?: Array<{
    month: number
    waterRetention: number
    aqiImprovement: number
    temperatureReduction: number
    carbonSequestration: number
    treeMaturity: number
  }> | null
  ecosystemBenefits?: Array<{
    category: string
    value: number
    percentage: number
  }> | null
  isLoading?: boolean
}

// Growing tree component that changes based on timeline
function GrowingTree({ progress }: { progress: number }) {
  // Progress: 0 = sapling, 100 = full grown tree
  const trunkHeight = 20 + progress * 0.8 // 20 to 100
  const canopySize = 10 + progress * 0.9 // 10 to 100
  const branches = Math.floor(progress / 20) // 0 to 5 branches
  const leafDensity = progress / 100

  return (
    <svg
      viewBox="0 0 120 140"
      className="w-full h-full transition-all duration-700"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.2))' }}
    >
      {/* Ground */}
      <ellipse
        cx="60"
        cy="135"
        rx={25 + progress * 0.15}
        ry="5"
        fill="oklch(0.25 0.02 150)"
      />

      {/* Roots (appear as tree grows) */}
      {progress > 30 && (
        <g stroke="oklch(0.45 0.08 80)" strokeWidth="2" fill="none">
          <path
            d={`M60,135 Q50,140 ${45 - progress * 0.1},138`}
            opacity={Math.min(1, (progress - 30) / 30)}
          />
          <path
            d={`M60,135 Q70,140 ${75 + progress * 0.1},138`}
            opacity={Math.min(1, (progress - 30) / 30)}
          />
        </g>
      )}

      {/* Trunk */}
      <path
        d={`M55,135 
           Q${55 - progress * 0.05},${135 - trunkHeight / 2} 
           ${54 - progress * 0.08},${135 - trunkHeight} 
           L${66 + progress * 0.08},${135 - trunkHeight} 
           Q${65 + progress * 0.05},${135 - trunkHeight / 2} 
           65,135 Z`}
        fill="url(#trunkGradient)"
        className="transition-all duration-500"
      />

      {/* Branches */}
      {branches >= 1 && (
        <path
          d={`M${58 - progress * 0.05},${135 - trunkHeight * 0.7} 
             Q${45 - progress * 0.1},${135 - trunkHeight * 0.75} 
             ${40 - progress * 0.15},${135 - trunkHeight * 0.6}`}
          stroke="oklch(0.45 0.08 80)"
          strokeWidth={2 + progress * 0.02}
          fill="none"
        />
      )}
      {branches >= 2 && (
        <path
          d={`M${62 + progress * 0.05},${135 - trunkHeight * 0.65} 
             Q${75 + progress * 0.1},${135 - trunkHeight * 0.7} 
             ${80 + progress * 0.15},${135 - trunkHeight * 0.55}`}
          stroke="oklch(0.45 0.08 80)"
          strokeWidth={2 + progress * 0.02}
          fill="none"
        />
      )}
      {branches >= 3 && (
        <path
          d={`M${56},${135 - trunkHeight * 0.85} 
             Q${48 - progress * 0.05},${135 - trunkHeight * 0.9} 
             ${42 - progress * 0.1},${135 - trunkHeight * 0.8}`}
          stroke="oklch(0.45 0.08 80)"
          strokeWidth={1.5 + progress * 0.015}
          fill="none"
        />
      )}
      {branches >= 4 && (
        <path
          d={`M${64},${135 - trunkHeight * 0.8} 
             Q${72 + progress * 0.05},${135 - trunkHeight * 0.85} 
             ${78 + progress * 0.1},${135 - trunkHeight * 0.75}`}
          stroke="oklch(0.45 0.08 80)"
          strokeWidth={1.5 + progress * 0.015}
          fill="none"
        />
      )}

      {/* Canopy layers */}
      <ellipse
        cx="60"
        cy={135 - trunkHeight - canopySize * 0.3}
        rx={canopySize * 0.6}
        ry={canopySize * 0.4}
        fill="url(#canopyGradient)"
        opacity={leafDensity * 0.8}
        className="transition-all duration-500"
      />
      <ellipse
        cx={60 - canopySize * 0.25}
        cy={135 - trunkHeight - canopySize * 0.15}
        rx={canopySize * 0.45}
        ry={canopySize * 0.35}
        fill="url(#canopyGradient2)"
        opacity={leafDensity * 0.9}
        className="transition-all duration-500"
      />
      <ellipse
        cx={60 + canopySize * 0.25}
        cy={135 - trunkHeight - canopySize * 0.15}
        rx={canopySize * 0.45}
        ry={canopySize * 0.35}
        fill="url(#canopyGradient2)"
        opacity={leafDensity * 0.9}
        className="transition-all duration-500"
      />
      <ellipse
        cx="60"
        cy={135 - trunkHeight - canopySize * 0.1}
        rx={canopySize * 0.5}
        ry={canopySize * 0.35}
        fill="url(#canopyGradient3)"
        opacity={leafDensity}
        className="transition-all duration-500"
      />

      {/* Small details - birds/fruits based on maturity */}
      {progress > 70 && (
        <>
          <circle
            cx={60 - canopySize * 0.3}
            cy={135 - trunkHeight - canopySize * 0.2}
            r="2"
            fill="#ef4444"
            opacity={(progress - 70) / 30}
          />
          <circle
            cx={60 + canopySize * 0.35}
            cy={135 - trunkHeight - canopySize * 0.1}
            r="2"
            fill="#ef4444"
            opacity={(progress - 70) / 30}
          />
          <circle
            cx={60 + canopySize * 0.1}
            cy={135 - trunkHeight - canopySize * 0.35}
            r="1.5"
            fill="#ef4444"
            opacity={(progress - 70) / 30}
          />
        </>
      )}

      {/* Gradients */}
      <defs>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.35 0.06 60)" />
          <stop offset="50%" stopColor="oklch(0.45 0.08 70)" />
          <stop offset="100%" stopColor="oklch(0.35 0.06 60)" />
        </linearGradient>
        <radialGradient id="canopyGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="oklch(0.65 0.2 145)" />
          <stop offset="100%" stopColor="oklch(0.45 0.15 150)" />
        </radialGradient>
        <radialGradient id="canopyGradient2" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="oklch(0.6 0.18 150)" />
          <stop offset="100%" stopColor="oklch(0.4 0.12 155)" />
        </radialGradient>
        <radialGradient id="canopyGradient3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.55 0.16 148)" />
          <stop offset="100%" stopColor="oklch(0.38 0.1 152)" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// Generate timeline data based on months
function generateTimelineData(months: number) {
  const baseWater = 30
  const baseAqi = 120
  const baseTemp = 35

  return Array.from({ length: 12 }, (_, i) => {
    const progress = Math.min(100, (months / 72) * 100 * ((i + 1) / 12))
    const growthFactor = Math.log(1 + progress / 20) / Math.log(6)

    return {
      month: `M${i + 1}`,
      waterRetention: Math.min(85, baseWater + growthFactor * 55 + Math.random() * 5),
      aqi: Math.max(40, baseAqi - growthFactor * 80 - Math.random() * 10),
      temperature: Math.max(26, baseTemp - growthFactor * 9 - Math.random() * 2),
    }
  })
}

// Pie chart data for ecosystem benefits
function generatePieData(months: number) {
  const progress = Math.min(100, (months / 72) * 100)
  const growthFactor = Math.log(1 + progress / 20) / Math.log(6)

  return [
    {
      name: 'Carbon Capture',
      value: Math.round(15 + growthFactor * 35),
      color: '#10b981',
    },
    {
      name: 'Biodiversity',
      value: Math.round(10 + growthFactor * 25),
      color: '#3b82f6',
    },
    {
      name: 'Soil Health',
      value: Math.round(20 + growthFactor * 20),
      color: '#f59e0b',
    },
    {
      name: 'Water Cycle',
      value: Math.round(15 + growthFactor * 20),
      color: '#06b6d4',
    },
  ]
}

const timelineMarks = [
  { value: 0, label: 'Now' },
  { value: 12, label: '1 Year' },
  { value: 36, label: '3 Years' },
  { value: 60, label: '5 Years' },
  { value: 72, label: '6 Years' },
]

export function PredictionPanel({
  predictions,
  timelineData: apiTimelineData,
  ecosystemBenefits: apiEcosystemBenefits,
  isLoading,
}: PredictionPanelProps) {
  const [timelineMonths, setTimelineMonths] = useState([36])

  const currentMonths = timelineMonths[0]
  const treeProgress = Math.min(100, (currentMonths / 72) * 100)
  
  const timelineData = useMemo(
    () => apiTimelineData || generateTimelineData(currentMonths),
    [apiTimelineData, currentMonths]
  )
  
  const pieData = useMemo(() => {
    if (apiEcosystemBenefits) {
      return apiEcosystemBenefits.map(benefit => ({
        name: benefit.category,
        value: benefit.percentage,
        color: benefit.category === 'Carbon Capture' ? '#10b981' :
               benefit.category === 'Biodiversity' ? '#8b5cf6' :
               benefit.category === 'Soil Health' ? '#f59e0b' :
               '#06b6d4'
      }))
    }
    return generatePieData(currentMonths)
  }, [apiEcosystemBenefits, currentMonths])

  const currentTimeLabel = useMemo(() => {
    if (currentMonths < 12) return `${currentMonths} months`
    const years = Math.floor(currentMonths / 12)
    const months = currentMonths % 12
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`
    return `${years}y ${months}m`
  }, [currentMonths])

  if (isLoading || !predictions) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline Slider with Growing Tree */}
      <Card className="p-6 bg-card/50 border-border/50">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Tree Visualization */}
          <div className="w-32 h-40 lg:w-40 lg:h-48 flex-shrink-0">
            <GrowingTree progress={treeProgress} />
          </div>

          {/* Timeline Control */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Growth Timeline
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drag to see ecosystem changes over time
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 bg-primary/10 text-primary border-primary/30"
              >
                {currentTimeLabel}
              </Badge>
            </div>

            {/* Slider */}
            <div className="px-2">
              <Slider
                value={timelineMonths}
                onValueChange={setTimelineMonths}
                min={0}
                max={72}
                step={1}
                className="w-full"
              />
              {/* Timeline marks */}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {timelineMarks.map((mark) => (
                  <button
                    key={mark.value}
                    type="button"
                    onClick={() => setTimelineMonths([mark.value])}
                    className={cn(
                      'hover:text-foreground transition-colors',
                      currentMonths === mark.value && 'text-primary font-medium'
                    )}
                  >
                    {mark.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <TreeDeciduous className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                <p className="text-xs text-muted-foreground">Maturity</p>
                <p className="text-sm font-semibold text-foreground">
                  {Math.round(treeProgress)}%
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Droplets className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                <p className="text-xs text-muted-foreground">Water Ret.</p>
                <p className="text-sm font-semibold text-foreground">
                  +{Math.round(treeProgress * 0.55)}%
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Wind className="h-4 w-4 mx-auto mb-1 text-cyan-400" />
                <p className="text-xs text-muted-foreground">AQI Improve</p>
                <p className="text-sm font-semibold text-foreground">
                  -{Math.round(treeProgress * 0.8)}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Thermometer className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                <p className="text-xs text-muted-foreground">Temp Drop</p>
                <p className="text-sm font-semibold text-foreground">
                  -{(treeProgress * 0.09).toFixed(1)}°C
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trends Chart */}
        <Card className="p-4 bg-card/50 border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Environmental Improvements
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Area
                  type="monotone"
                  dataKey="waterRetention"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#waterGradient)"
                  name="Water Retention %"
                />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="AQI"
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Temperature °C"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span className="text-muted-foreground">Water Retention</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-emerald-500" />
              <span className="text-muted-foreground">AQI</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-amber-500" />
              <span className="text-muted-foreground">Temperature</span>
            </div>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-4 bg-card/50 border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            Ecosystem Benefits Distribution
          </h4>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground truncate">
                  {item.name}
                </span>
                <span className="text-foreground font-medium ml-auto">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Predictions Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          AI-Powered Forecasts
        </h3>
        {predictions.map((prediction, index) => (
          <div
            key={prediction.timeframe}
            className="rounded-xl border border-border/50 bg-card/30 p-4 transition-all hover:border-border"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">
                  {prediction.timeframe}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {prediction.ndviPrediction.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">NDVI Prediction</p>
              </div>
            </div>

            {/* Confidence Interval */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Confidence Interval</span>
                <span>
                  {prediction.confidenceInterval[0].toFixed(2)} -{' '}
                  {prediction.confidenceInterval[1].toFixed(2)}
                </span>
              </div>
              <div className="relative h-2 w-full rounded-full bg-muted">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-primary/50 to-primary"
                  style={{
                    left: `${prediction.confidenceInterval[0] * 100}%`,
                    width: `${(prediction.confidenceInterval[1] - prediction.confidenceInterval[0]) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-foreground"
                  style={{
                    left: `${prediction.ndviPrediction * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Risk Factors */}
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                Risk Factors
              </h4>
              <div className="space-y-2">
                {prediction.riskFactors.map((risk, riskIndex) => (
                  <div
                    key={riskIndex}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={cn(
                          'h-4 w-4',
                          risk.impact === 'high'
                            ? 'text-rose-400'
                            : risk.impact === 'medium'
                              ? 'text-amber-400'
                              : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-sm text-foreground">
                        {risk.factor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          risk.impact === 'high'
                            ? 'destructive'
                            : risk.impact === 'medium'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {risk.impact}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(risk.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimal Actions */}
            <div>
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                Recommended Actions
              </h4>
              <div className="space-y-1.5">
                {prediction.optimalActions.map((action, actionIndex) => (
                  <div
                    key={actionIndex}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
