import type { ChatMessage, FlowNode, FlowConnection } from "./types"
import { getSummarizedMessage } from "./data"

export const calculateFlowLayout = (
  messages: ChatMessage[],
  containerWidth = 1200,
  containerHeight = 800,
): { nodes: FlowNode[]; connections: FlowConnection[] } => {
  const nodes: FlowNode[] = []
  const connections: FlowConnection[] = []

  const nodeWidth = 320
  const nodeHeight = 240
  const horizontalSpacing = 400
  const verticalSpacing = 280
  const startX = 100
  const startY = 150
  const maxNodesPerRow = Math.floor((containerWidth - startX) / horizontalSpacing) || 3

  messages.forEach((message, index) => {
    const row = Math.floor(index / maxNodesPerRow)
    const col = index % maxNodesPerRow
    const x = startX + col * horizontalSpacing
    const y = startY + row * verticalSpacing

    const node: FlowNode = {
      ...message,
      content: message.role === "assistant" ? getSummarizedMessage(message) : message.content,
      position: { x, y },
      connections: index < messages.length - 1 ? [index + 1] : [],
      isVisible: true,
      isHighlighted: false,
      animationDelay: index * 200,
    }

    nodes.push(node)

    if (index < messages.length - 1) {
      const nextMessage = messages[index + 1]
      const currentEmotions = message.emotions.map((e) => e.label).join(", ")
      const nextEmotions = nextMessage.emotions.map((e) => e.label).join(", ")

      const avgConfidence = message.emotions.reduce((sum, e) => sum + e.confidence, 0) / message.emotions.length

      const nextRow = Math.floor((index + 1) / maxNodesPerRow)
      const nextCol = (index + 1) % maxNodesPerRow
      const nextX = startX + nextCol * horizontalSpacing
      const nextY = startY + nextRow * verticalSpacing

      const connection: FlowConnection = {
        from: message.id,
        to: nextMessage.id,
        emotionTransition: `${currentEmotions} → ${nextEmotions}`,
        strength: avgConfidence,
        path: calculateConnectionPath({ x, y }, { x: nextX, y: nextY }),
      }

      connections.push(connection)
    }
  })

  return { nodes, connections }
}

export const calculateConnectionPath = (start: { x: number; y: number }, end: { x: number; y: number }): string => {
  const nodeWidth = 320
  const nodeHeight = 240

  // Calculate connection points
  const startX = start.x + nodeWidth / 2
  const startY = start.y + nodeHeight
  const endX = end.x + nodeWidth / 2
  const endY = end.y

  // Create different path styles based on relative positions
  if (Math.abs(start.y - end.y) < 50) {
    // Same row - horizontal connection
    const midX = startX + (endX - startX) / 2
    return `M ${startX + nodeWidth / 2} ${startY - nodeHeight / 2} C ${midX} ${startY - nodeHeight / 2}, ${midX} ${endY + nodeHeight / 2}, ${endX - nodeWidth / 2} ${endY + nodeHeight / 2}`
  } else {
    // Different rows - vertical connection
    const midY = startY + (endY - startY) / 2
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
  }
}

export const filterNodes = (
  nodes: FlowNode[],
  filterState: {
    emotions: string[]
    roles: ("user" | "assistant")[]
    confidenceThreshold: number
  },
): FlowNode[] => {
  return nodes.map((node) => {
    let isVisible = true

    // Filter by role
    if (filterState.roles.length > 0 && !filterState.roles.includes(node.role)) {
      isVisible = false
    }

    // Filter by emotions
    if (filterState.emotions.length > 0) {
      const hasMatchingEmotion = node.emotions.some((emotion) => filterState.emotions.includes(emotion.label))
      if (!hasMatchingEmotion) {
        isVisible = false
      }
    }

    // Filter by confidence threshold
    const maxConfidence = Math.max(...node.emotions.map((e) => e.confidence))
    if (maxConfidence < filterState.confidenceThreshold) {
      isVisible = false
    }

    return { ...node, isVisible }
  })
}
