export interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  emotions: Emotion[]
}

export interface Emotion {
  label: string
  confidence: number
}

export interface FlowNode extends ChatMessage {
  position: { x: number; y: number }
  connections: number[]
  isVisible: boolean
  isHighlighted: boolean
  animationDelay: number
}

export interface FlowConnection {
  from: number
  to: number
  emotionTransition: string
  strength: number
  path: string
}

export interface FilterState {
  emotions: string[]
  roles: ("user" | "assistant")[]
  confidenceThreshold: number
  showConnections: boolean
}

export interface ViewportState {
  x: number
  y: number
  scale: number
  width: number
  height: number
}

export type EmotionConfidenceLevel = "high" | "medium" | "low"

export interface ExportOptions {
  format: "png" | "json" | "summary"
  includeEmotions: boolean
  includeConnections: boolean
}
