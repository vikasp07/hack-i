'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HistoryEntry } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TrendsChartProps {
  data: HistoryEntry[]
  isLoading?: boolean
}

export function TrendsChart({ data, isLoading }: TrendsChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[280px] w-full" />
      </div>
    )
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number; color: string; name: string }>
    label?: string
  }) => {
    if (!active || !payload) return null

    return (
      <div className="rounded-lg border border-border/50 bg-card/95 p-3 shadow-xl backdrop-blur-sm">
        <p className="mb-2 font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-medium text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="combined" className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-3 bg-muted/50">
        <TabsTrigger value="combined">NDVI + Rainfall</TabsTrigger>
        <TabsTrigger value="moisture">Moisture</TabsTrigger>
        <TabsTrigger value="temperature">Temperature</TabsTrigger>
      </TabsList>

      <TabsContent value="combined" className="mt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                domain={[0, 1]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                domain={[0, 400]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <Bar
                yAxisId="right"
                dataKey="rainfall"
                name="Rainfall (mm)"
                fill="#3b82f6"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="ndvi"
                name="NDVI Index"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorNdvi)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="moisture" className="mt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="moisture"
                name="Moisture Index (%)"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#colorMoisture)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="temperature" className="mt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                domain={[20, 45]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#colorTemp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
