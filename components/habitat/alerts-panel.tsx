'use client'

import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { Alert } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface AlertsPanelProps {
  alerts: Alert[]
  isLoading?: boolean
}

export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  const getAlertConfig = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          icon: AlertCircle,
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/30',
          iconColor: 'text-rose-500',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          iconColor: 'text-amber-500',
        }
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          iconColor: 'text-blue-500',
        }
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2 pr-4">
        {alerts.map((alert) => {
          const config = getAlertConfig(alert.type)
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-all hover:bg-card/50',
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconColor)} />
              <div className="flex-1 space-y-1">
                <p className="text-sm text-foreground">{alert.message}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatTimestamp(alert.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
