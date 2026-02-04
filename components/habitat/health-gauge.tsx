'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface HealthGaugeProps {
  score: number
  isLoading?: boolean
  simulatedScore?: number
}

export function HealthGauge({
  score,
  isLoading,
  simulatedScore,
}: HealthGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const displayScore = simulatedScore ?? score

  useEffect(() => {
    if (isLoading) {
      setAnimatedScore(0)
      return
    }

    const duration = 1500
    const steps = 60
    const increment = displayScore / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= displayScore) {
        setAnimatedScore(displayScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [displayScore, isLoading])

  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-emerald-500'
    if (s >= 40) return 'text-amber-500'
    return 'text-rose-500'
  }

  const getStrokeColor = (s: number) => {
    if (s >= 70) return '#10b981'
    if (s >= 40) return '#f59e0b'
    return '#f43f5e'
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-32 w-32">
        {/* Background circle */}
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress circle */}
          {!isLoading && (
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke={getStrokeColor(displayScore)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${getStrokeColor(displayScore)}50)`,
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="h-10 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <span
                className={cn(
                  'font-mono text-3xl font-bold transition-colors',
                  getScoreColor(displayScore)
                )}
              >
                {animatedScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-foreground">Ecosystem Health</p>
        {!isLoading && (
          <p
            className={cn(
              'text-xs',
              displayScore >= 70
                ? 'text-emerald-500'
                : displayScore >= 40
                  ? 'text-amber-500'
                  : 'text-rose-500'
            )}
          >
            {displayScore >= 70
              ? 'Healthy'
              : displayScore >= 40
                ? 'Moderate'
                : 'Critical'}
          </p>
        )}
      </div>
    </div>
  )
}
