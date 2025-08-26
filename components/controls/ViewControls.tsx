"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react"

interface ViewControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToContent: () => void
  onReset: () => void
  currentZoom: number
}

export function ViewControls({ onZoomIn, onZoomOut, onFitToContent, onReset, currentZoom }: ViewControlsProps) {
  return (
    <Card className="bg-background/80 backdrop-blur-sm">
      <CardContent className="p-2">
        <div className="flex flex-col space-y-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            className="w-full justify-start bg-transparent"
            disabled={currentZoom >= 3}
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            Zoom In
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            className="w-full justify-start bg-transparent"
            disabled={currentZoom <= 0.1}
          >
            <ZoomOut className="w-4 h-4 mr-2" />
            Zoom Out
          </Button>

          <Button variant="outline" size="sm" onClick={onFitToContent} className="w-full justify-start bg-transparent">
            <Maximize className="w-4 h-4 mr-2" />
            Fit to Screen
          </Button>

          <Button variant="outline" size="sm" onClick={onReset} className="w-full justify-start bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset View
          </Button>

          <div className="text-xs text-muted-foreground text-center pt-1 border-t border-border">
            {Math.round(currentZoom * 100)}%
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
