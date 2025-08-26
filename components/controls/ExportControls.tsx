"use client"

import { useState } from "react"
import type { FlowNode, FlowConnection, FilterState } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileImage, FileText, Database } from "lucide-react"

interface ExportControlsProps {
  nodes: FlowNode[]
  connections: FlowConnection[]
  filterState: FilterState
}

export function ExportControls({ nodes, connections, filterState }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const visibleNodes = nodes.filter((node) => node.isVisible)
  const visibleConnections = connections.filter((conn) => {
    const fromNode = nodes.find((n) => n.id === conn.from)
    const toNode = nodes.find((n) => n.id === conn.to)
    return fromNode?.isVisible && toNode?.isVisible
  })

  const handleExportPNG = async () => {
    setIsExporting(true)
    try {
      // In a real implementation, this would capture the SVG/Canvas and convert to PNG
      // For now, we'll simulate the export
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a simple text representation for demo
      const exportData = `Conversation Flow Export\n\nNodes: ${visibleNodes.length}\nConnections: ${visibleConnections.length}\n\nExported at: ${new Date().toISOString()}`

      const blob = new Blob([exportData], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "conversation-flow.txt"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalNodes: nodes.length,
          visibleNodes: visibleNodes.length,
          totalConnections: connections.length,
          visibleConnections: visibleConnections.length,
          appliedFilters: filterState,
        },
        nodes: visibleNodes.map((node) => ({
          id: node.id,
          role: node.role,
          content: node.content,
          emotions: node.emotions,
          position: node.position,
        })),
        connections: visibleConnections.map((conn) => ({
          from: conn.from,
          to: conn.to,
          emotionTransition: conn.emotionTransition,
          strength: conn.strength,
        })),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "conversation-flow-data.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSummary = async () => {
    setIsExporting(true)
    try {
      // Generate conversation summary
      const userMessages = visibleNodes.filter((n) => n.role === "user")
      const assistantMessages = visibleNodes.filter((n) => n.role === "assistant")

      // Analyze emotion patterns
      const allEmotions = visibleNodes.flatMap((n) => n.emotions)
      const emotionCounts = allEmotions.reduce(
        (acc, emotion) => {
          acc[emotion.label] = (acc[emotion.label] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topEmotions = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([emotion, count]) => `${emotion} (${count} occurrences)`)

      const summary = `# Conversation Flow Analysis Summary
      
## Overview
- **Total Messages**: ${visibleNodes.length}
- **User Messages**: ${userMessages.length}
- **Assistant Messages**: ${assistantMessages.length}
- **Connections**: ${visibleConnections.length}

## Emotion Analysis
### Top Emotions:
${topEmotions.map((emotion) => `- ${emotion}`).join("\n")}

### Emotion Evolution:
${visibleNodes
  .map((node, index) => {
    const topEmotion = node.emotions.reduce((prev, current) => (prev.confidence > current.confidence ? prev : current))
    return `${index + 1}. ${node.role}: ${topEmotion.label} (${topEmotion.confidence}%)`
  })
  .join("\n")}

## Conversation Flow:
${visibleNodes
  .map(
    (node, index) =>
      `### Message ${node.id} (${node.role})
${node.content.substring(0, 100)}${node.content.length > 100 ? "..." : ""}

**Emotions**: ${node.emotions.map((e) => `${e.label} (${e.confidence}%)`).join(", ")}
`,
  )
  .join("\n")}

---
*Generated on ${new Date().toLocaleString()}*
`

      const blob = new Blob([summary], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "conversation-analysis-summary.md"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export Options</span>
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Badge variant="outline">{visibleNodes.length} nodes</Badge>
          <Badge variant="outline">{visibleConnections.length} connections</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={handleExportPNG}
            disabled={isExporting}
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
          >
            <FileImage className="w-6 h-6" />
            <div className="text-center">
              <div className="font-medium">Export as Image</div>
              <div className="text-xs text-muted-foreground">PNG format</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportJSON}
            disabled={isExporting}
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
          >
            <Database className="w-6 h-6" />
            <div className="text-center">
              <div className="font-medium">Export Data</div>
              <div className="text-xs text-muted-foreground">JSON format</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportSummary}
            disabled={isExporting}
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
          >
            <FileText className="w-6 h-6" />
            <div className="text-center">
              <div className="font-medium">Export Summary</div>
              <div className="text-xs text-muted-foreground">Markdown report</div>
            </div>
          </Button>
        </div>

        {isExporting && <div className="mt-4 text-center text-sm text-muted-foreground">Preparing export...</div>}
      </CardContent>
    </Card>
  )
}
