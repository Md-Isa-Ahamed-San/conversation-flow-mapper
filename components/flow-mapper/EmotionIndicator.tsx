"use client"

import type { Emotion, EmotionConfidenceLevel } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { getEmotionConfidenceLevel } from "@/lib/data"

interface EmotionIndicatorProps {
  emotion: Emotion
  onClick?: (emotion: Emotion) => void
  isHighlighted?: boolean
}

export function EmotionIndicator({ emotion, onClick, isHighlighted = false }: EmotionIndicatorProps) {
  const confidenceLevel = getEmotionConfidenceLevel(emotion.confidence)

  const getEmotionStyles = (level: EmotionConfidenceLevel) => {
    switch (level) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
      case "low":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick(emotion)
    }
  }

  return (
    <Badge
      variant="outline"
      className={`
        emotion-indicator cursor-pointer transition-all duration-200
        ${getEmotionStyles(confidenceLevel)}
        ${isHighlighted ? "ring-2 ring-primary ring-offset-1" : ""}
        ${onClick ? "hover:scale-105" : ""}
      `}
      onClick={handleClick}
      title={`${emotion.label}: ${emotion.confidence}% confidence`}
    >
      <span className="font-medium">{emotion.label}</span>
      <span className="ml-1 text-xs opacity-75">{emotion.confidence}%</span>
    </Badge>
  )
}
