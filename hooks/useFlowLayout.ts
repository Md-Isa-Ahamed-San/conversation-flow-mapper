"use client"

import { useState, useEffect, useCallback } from "react"
import type { FlowNode, FlowConnection, ChatMessage, FilterState } from "@/lib/types"
import { calculateFlowLayout, filterNodes } from "@/lib/flow-calculator"

export const useFlowLayout = (messages: ChatMessage[]) => {
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [connections, setConnections] = useState<FlowConnection[]>([])
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 })

  // Initialize layout
  useEffect(() => {
    const { nodes: initialNodes, connections: initialConnections } = calculateFlowLayout(
      messages,
      containerSize.width,
      containerSize.height,
    )
    setNodes(initialNodes)
    setConnections(initialConnections)
  }, [messages, containerSize])

  // Update layout when container size changes
  const updateContainerSize = useCallback((width: number, height: number) => {
    setContainerSize({ width, height })
  }, [])

  const updateNodePosition = useCallback((nodeId: number, newPosition: { x: number; y: number }) => {
    setNodes((prevNodes) => prevNodes.map((node) => (node.id === nodeId ? { ...node, position: newPosition } : node)))
  }, [])

  // Apply filters to nodes
  const applyFilters = useCallback((filterState: FilterState) => {
    setNodes((prevNodes) => {
      const filteredNodes = filterNodes(prevNodes, filterState)
      return filteredNodes
    })
  }, [])

  // Highlight specific nodes
  const highlightNodes = useCallback((nodeIds: number[]) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        isHighlighted: nodeIds.includes(node.id),
      })),
    )
  }, [])

  // Reset all filters and highlights
  const resetLayout = useCallback(() => {
    const { nodes: resetNodes, connections: resetConnections } = calculateFlowLayout(
      messages,
      containerSize.width,
      containerSize.height,
    )
    setNodes(resetNodes)
    setConnections(resetConnections)
  }, [messages, containerSize])

  return {
    nodes,
    connections,
    updateContainerSize,
    applyFilters,
    highlightNodes,
    resetLayout,
    updateNodePosition,
  }
}
