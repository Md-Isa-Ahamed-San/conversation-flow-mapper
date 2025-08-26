"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ViewportState } from "@/lib/types"

export const useViewport = (initialWidth = 1200, initialHeight = 800) => {
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    scale: 1,
    width: initialWidth,
    height: initialHeight,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle zoom
  const zoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setViewport((prev) => {
      const newScale = Math.max(0.1, Math.min(3, prev.scale + delta))

      if (centerX !== undefined && centerY !== undefined) {
        // Zoom towards a specific point
        const scaleRatio = newScale / prev.scale
        const newX = centerX - (centerX - prev.x) * scaleRatio
        const newY = centerY - (centerY - prev.y) * scaleRatio

        return {
          ...prev,
          scale: newScale,
          x: newX,
          y: newY,
        }
      }

      return { ...prev, scale: newScale }
    })
  }, [])

  // Handle pan
  const pan = useCallback((deltaX: number, deltaY: number) => {
    setViewport((prev) => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))
  }, [])

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const centerX = event.clientX - rect.left
      const centerY = event.clientY - rect.top
      const delta = -event.deltaY * 0.001

      zoom(delta, centerX, centerY)
    },
    [zoom],
  )

  // Handle mouse drag
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: event.clientX - viewport.x, y: event.clientY - viewport.y })
    },
    [viewport.x, viewport.y],
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging) return

      const newX = event.clientX - dragStart.x
      const newY = event.clientY - dragStart.y

      setViewport((prev) => ({ ...prev, x: newX, y: newY }))
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Fit content to viewport
  const fitToContent = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      x: 0,
      y: 0,
      scale: 1,
    }))
  }, [])

  // Reset viewport
  const resetViewport = useCallback(() => {
    setViewport({
      x: 0,
      y: 0,
      scale: 1,
      width: initialWidth,
      height: initialHeight,
    })
  }, [initialWidth, initialHeight])

  // Update container size
  const updateSize = useCallback((width: number, height: number) => {
    setViewport((prev) => ({ ...prev, width, height }))
  }, [])

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      container.removeEventListener("wheel", handleWheel)
    }
  }, [handleWheel])

  return {
    viewport,
    containerRef,
    isDragging,
    zoom,
    pan,
    fitToContent,
    resetViewport,
    updateSize,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}
