"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { FlowNode, FlowConnection } from "@/lib/types"
import { ConversationNode } from "./ConversationNode"
import { ConnectionLine } from "./ConnectionLine"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react"

interface FlowViewportProps {
  nodes: FlowNode[]
  connections: FlowConnection[]
  viewport: {
    x: number
    y: number
    scale: number
    width: number
    height: number
  }
  onNodeClick?: (node: FlowNode) => void
  onEmotionClick?: (emotion: string) => void
  onViewportChange?: (width: number, height: number) => void
  onCreateBranch?: (nodeId: number) => void
  onNodeDrag?: (nodeId: number, newPosition: { x: number; y: number }) => void
  selectedNodeId?: number
  highlightedConnections?: number[]
}

export function FlowViewport({
  nodes,
  connections,
  viewport,
  onNodeClick,
  onEmotionClick,
  onViewportChange,
  onCreateBranch,
  onNodeDrag,
  selectedNodeId,
  highlightedConnections = [],
}: FlowViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Update viewport size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && onViewportChange) {
        const { clientWidth, clientHeight } = containerRef.current
        onViewportChange(clientWidth, clientHeight)
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)

    return () => window.removeEventListener("resize", updateSize)
  }, [onViewportChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(3, zoomLevel * delta))
    setZoomLevel(newZoom)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(3, prev * 1.2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.1, prev / 1.2))
  }

  const handleResetView = () => {
    setPanOffset({ x: 0, y: 0 })
    setZoomLevel(1)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 50
      switch (e.key) {
        case "ArrowLeft":
          setPanOffset((prev) => ({ ...prev, x: prev.x + step }))
          break
        case "ArrowRight":
          setPanOffset((prev) => ({ ...prev, x: prev.x - step }))
          break
        case "ArrowUp":
          setPanOffset((prev) => ({ ...prev, y: prev.y + step }))
          break
        case "ArrowDown":
          setPanOffset((prev) => ({ ...prev, y: prev.y - step }))
          break
        case "+":
        case "=":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
        case "0":
          handleResetView()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Calculate the bounds of all visible nodes
  const getContentBounds = () => {
    const visibleNodes = nodes.filter((node) => node.isVisible)
    if (visibleNodes.length === 0) return { minX: 0, minY: 0, maxX: 1200, maxY: 800 }

    const positions = visibleNodes.map((node) => node.position)
    const minX = Math.min(...positions.map((p) => p.x)) - 50
    const minY = Math.min(...positions.map((p) => p.y)) - 50
    const maxX = Math.max(...positions.map((p) => p.x)) + 370 // node width + padding
    const maxY = Math.max(...positions.map((p) => p.y)) + 230 // node height + padding

    return { minX, minY, maxX, maxY }
  }

  const contentBounds = getContentBounds()
  const svgWidth = Math.max(viewport.width, contentBounds.maxX - contentBounds.minX)
  const svgHeight = Math.max(viewport.height, contentBounds.maxY - contentBounds.minY)

  return (
    <div
      ref={containerRef}
      className={`flow-viewport relative w-full h-[600px] bg-card border border-border rounded-lg overflow-hidden ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)",
        backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      tabIndex={0}
    >
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
          onClick={handleZoomIn}
          title="Zoom In (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
          onClick={handleResetView}
          title="Reset View (0)"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* SVG layer for connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={svgWidth}
        height={svgHeight}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "0 0",
        }}
      >
        <defs>
          {/* Gradient definitions for connections */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3182ce" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4299e1" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {connections.map((connection, index) => {
          const fromNode = nodes.find((n) => n.id === connection.from)
          const toNode = nodes.find((n) => n.id === connection.to)
          const isVisible = fromNode?.isVisible && toNode?.isVisible
          const isHighlighted =
            highlightedConnections.includes(connection.from) || highlightedConnections.includes(connection.to)

          return (
            <ConnectionLine
              key={`${connection.from}-${connection.to}`}
              connection={connection}
              isVisible={isVisible}
              isHighlighted={isHighlighted}
              animationDelay={index * 100}
            />
          )
        })}
      </svg>

      {/* Nodes layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "0 0",
        }}
      >
        <div className="pointer-events-auto">
          {nodes.map((node, index) => (
            <ConversationNode
              key={node.id}
              node={node}
              onClick={onNodeClick}
              onEmotionClick={onEmotionClick}
              onCreateBranch={onCreateBranch}
              onNodeDrag={onNodeDrag}
              isSelected={selectedNodeId === node.id}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm border border-border rounded-md px-3 py-2 text-xs text-muted-foreground">
        <div>Zoom: {Math.round(zoomLevel * 100)}%</div>
        <div>
          Nodes: {nodes.filter((n) => n.isVisible).length}/{nodes.length}
        </div>
        <div className="mt-1 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Move className="h-3 w-3" />
            <span>Arrow keys to pan</span>
          </div>
          <div>Mouse wheel to zoom</div>
          <div>Press 0 to reset view</div>
        </div>
      </div>
    </div>
  )
}
