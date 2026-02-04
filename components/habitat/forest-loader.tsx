'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Leaf {
  id: number
  x: number
  delay: number
  duration: number
  size: number
  rotation: number
  type: 'leaf' | 'pine' | 'maple'
}

interface ForestLoaderProps {
  message?: string
  className?: string
}

export function ForestLoader({
  message = 'Analyzing ecosystem data...',
  className,
}: ForestLoaderProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [trees, setTrees] = useState<number[]>([])

  useEffect(() => {
    // Generate falling leaves
    const newLeaves: Leaf[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: 12 + Math.random() * 8,
      rotation: Math.random() * 360,
      type: (['leaf', 'pine', 'maple'] as const)[Math.floor(Math.random() * 3)],
    }))
    setLeaves(newLeaves)

    // Generate growing trees
    setTrees([0, 1, 2, 3, 4])
  }, [])

  const LeafIcon = ({ type, size }: { type: string; size: number }) => {
    if (type === 'pine') {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-emerald-500/60"
        >
          <path d="M12 2L6 10h3v4H6l6 8 6-8h-3v-4h3L12 2z" />
        </svg>
      )
    }
    if (type === 'maple') {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-amber-500/60"
        >
          <path d="M12 2L8 8l-4-2 2 6-4 2 6 2v6h4v-6l6-2-4-2 2-6-4 2-4-6z" />
        </svg>
      )
    }
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-emerald-400/60"
      >
        <path d="M17 8C17 6.34 15.66 5 14 5c-.42 0-.82.09-1.19.24A5.01 5.01 0 007 9c0 .56.09 1.1.26 1.6C5.38 11.2 4 13 4 15c0 2.76 2.24 5 5 5h9c2.21 0 4-1.79 4-4 0-2.21-1.79-4-4-4-.34 0-.67.04-1 .11V8z" />
      </svg>
    )
  }

  return (
    <div
      className={cn(
        'relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40',
        className
      )}
    >
      {/* Falling leaves */}
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute animate-forest-fall pointer-events-none"
          style={{
            left: `${leaf.x}%`,
            top: '-20px',
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
          }}
        >
          <LeafIcon type={leaf.type} size={leaf.size} />
        </div>
      ))}

      {/* Growing trees */}
      <div className="absolute bottom-0 flex w-full items-end justify-around px-8">
        {trees.map((i) => (
          <div
            key={i}
            className="relative flex flex-col items-center animate-forest-grow animate-forest-sway"
            style={{
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {/* Tree crown */}
            <div
              className="relative"
              style={{
                width: `${30 + i * 5}px`,
                height: `${40 + i * 8}px`,
              }}
            >
              <svg
                viewBox="0 0 60 80"
                className="w-full h-full text-emerald-600/40"
                fill="currentColor"
              >
                <path d="M30 0L5 35h10L5 55h15L10 80h40L40 55h15L45 35h10L30 0z" />
              </svg>
            </div>
            {/* Tree trunk */}
            <div
              className="w-2 bg-amber-800/40 rounded-b"
              style={{ height: `${15 + i * 3}px` }}
            />
          </div>
        ))}
      </div>

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* DNA Helix style loader */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
            <svg
              className="h-6 w-6 text-primary animate-spin"
              style={{ animationDuration: '3s' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground animate-pulse">
            {message}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ground effect */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-emerald-900/20 to-transparent" />


    </div>
  )
}
