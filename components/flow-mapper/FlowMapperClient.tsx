"use client"

import { useState, useCallback } from "react"
import type { FlowNode, FilterState } from "@/lib/types"
import { messages } from "@/lib/data"
import { useFlowLayout } from "@/hooks/useFlowLayout"
import { useViewport } from "@/hooks/useViewport"
import { FlowViewport } from "./FlowViewport"
import { FilterControls } from "../controls/FilterControls"
import { ViewControls } from "../controls/ViewControls"

interface FlowMapperClientProps {
  onCreateBranch?: (conversationHistory: string) => void
}

export function FlowMapperClient({ onCreateBranch }: FlowMapperClientProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>()
  const [highlightedConnections, setHighlightedConnections] = useState<number[]>([])
  const [filterState, setFilterState] = useState<FilterState>({
    emotions: [],
    roles: [],
    confidenceThreshold: 0,
    showConnections: true,
  })

  const { nodes, connections, applyFilters, highlightNodes, resetLayout, updateNodePosition } = useFlowLayout(messages)
  const { viewport, containerRef, zoom, pan, fitToContent, resetViewport, updateSize } = useViewport()

  const handleCreateBranch = useCallback(
    (nodeId: number) => {
      if (!onCreateBranch) return

      // Get conversation history up to the selected node
      const nodeIndex = messages.findIndex((msg) => msg.id === nodeId)
      const conversationHistory = messages
        .slice(0, nodeIndex + 1)
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join(", ")

      onCreateBranch(conversationHistory)
    },
    [onCreateBranch],
  )

  const handleNodeDrag = useCallback(
    (nodeId: number, newPosition: { x: number; y: number }) => {
      updateNodePosition(nodeId, newPosition)
    },
    [updateNodePosition],
  )

  // Handle node selection
  const handleNodeClick = useCallback(
    (node: FlowNode) => {
      setSelectedNodeId(node.id)

      // Highlight connected nodes
      const connectedNodeIds = [
        ...connections.filter((c) => c.from === node.id).map((c) => c.to),
        ...connections.filter((c) => c.to === node.id).map((c) => c.from),
      ]

      setHighlightedConnections([node.id, ...connectedNodeIds])
      highlightNodes([node.id, ...connectedNodeIds])
    },
    [connections, highlightNodes],
  )

  // Handle emotion filtering
  const handleEmotionClick = useCallback(
    (emotion: string) => {
      const newEmotions = filterState.emotions.includes(emotion)
        ? filterState.emotions.filter((e) => e !== emotion)
        : [...filterState.emotions, emotion]

      const newFilterState = { ...filterState, emotions: newEmotions }
      setFilterState(newFilterState)
      applyFilters(newFilterState)
    },
    [filterState, applyFilters],
  )

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilterState: FilterState) => {
      setFilterState(newFilterState)
      applyFilters(newFilterState)
    },
    [applyFilters],
  )

  // Reset all filters and selections
  const handleReset = useCallback(() => {
    const resetFilterState: FilterState = {
      emotions: [],
      roles: [],
      confidenceThreshold: 0,
      showConnections: true,
    }
    setFilterState(resetFilterState)
    setSelectedNodeId(undefined)
    setHighlightedConnections([])
    resetLayout()
    resetViewport()
  }, [resetLayout, resetViewport])

  // Handle viewport controls
  const handleZoomIn = () => zoom(0.2)
  const handleZoomOut = () => zoom(-0.2)
  const handleFitToContent = () => fitToContent()
  const handleResetView = () => resetViewport()

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <FilterControls filterState={filterState} onFilterChange={handleFilterChange} onReset={handleReset} />

      {/* Main Flow Visualization */}
      <div className="relative">
        <FlowViewport
          nodes={nodes}
          connections={filterState.showConnections ? connections : []}
          viewport={viewport}
          onNodeClick={handleNodeClick}
          onEmotionClick={handleEmotionClick}
          onViewportChange={updateSize}
          onCreateBranch={handleCreateBranch}
          onNodeDrag={handleNodeDrag}
          selectedNodeId={selectedNodeId}
          highlightedConnections={highlightedConnections}
        />

        {/* Viewport Controls Overlay */}
        <div className="absolute top-4 right-4">
          <ViewControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToContent={handleFitToContent}
            onReset={handleResetView}
            currentZoom={viewport.scale}
          />
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNodeId && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Selected Message #{selectedNodeId}</h3>
          {(() => {
            const selectedNode = nodes.find((n) => n.id === selectedNodeId)
            if (!selectedNode) return null

            return (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Role:</strong> {selectedNode.role}
                </p>
                <p className="text-sm">
                  <strong>Content:</strong> {selectedNode.content}
                </p>
                <div>
                  <strong className="text-sm">Emotions:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.emotions.map((emotion, index) => (
                      <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {emotion.label} ({emotion.confidence}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
