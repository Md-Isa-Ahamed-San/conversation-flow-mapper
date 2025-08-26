"use client"

import type { FlowConnection } from "@/lib/types"

interface ConnectionLineProps {
  connection: FlowConnection
  isVisible?: boolean
  isHighlighted?: boolean
  animationDelay?: number
}

export function ConnectionLine({
  connection,
  isVisible = true,
  isHighlighted = false,
  animationDelay = 0,
}: ConnectionLineProps) {
  if (!isVisible) return null

  const getStrokeWidth = (strength: number) => {
    if (strength >= 80) return 3
    if (strength >= 60) return 2
    return 1
  }

  const getStrokeColor = (strength: number) => {
    if (strength >= 80) return "#3182ce"
    if (strength >= 60) return "#4299e1"
    return "#90cdf4"
  }

  const strokeWidth = getStrokeWidth(connection.strength)
  const strokeColor = getStrokeColor(connection.strength)

  return (
    <g
      className="connection-line"
      style={{
        animationDelay: `${animationDelay}ms`,
        opacity: isHighlighted ? 1 : 0.7,
      }}
    >
      {/* Main connection path */}
      <path
        d={connection.path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`
          transition-all duration-300
          ${isHighlighted ? "stroke-primary" : ""}
        `}
        style={{
          filter: isHighlighted ? "drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))" : undefined,
        }}
      />

      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrow-${connection.from}-${connection.to}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={isHighlighted ? "#3b82f6" : strokeColor} />
        </marker>
      </defs>

      {/* Apply arrow marker to path */}
      <path
        d={connection.path}
        stroke="transparent"
        strokeWidth={strokeWidth}
        fill="none"
        markerEnd={`url(#arrow-${connection.from}-${connection.to})`}
      />

      {/* Emotion transition label (shown on hover) */}
      {isHighlighted && (
        <foreignObject x="50%" y="50%" width="200" height="40" className="pointer-events-none">
          <div className="bg-popover border border-border rounded-md px-2 py-1 text-xs text-popover-foreground shadow-md">
            <div className="font-medium">Emotion Flow</div>
            <div className="text-muted-foreground truncate">Confidence: {Math.round(connection.strength)}%</div>
          </div>
        </foreignObject>
      )}
    </g>
  )
}
