"use client"

import type React from "react"

import { useState } from "react"
import type { FlowNode } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Bot, MessageCircle, Zap, GitBranch } from "lucide-react"

interface ConversationNodeProps {
  node: FlowNode
  onClick?: (node: FlowNode) => void
  onEmotionClick?: (emotion: string) => void
  onCreateBranch?: (nodeId: number) => void
  onNodeDrag?: (nodeId: number, newPosition: { x: number; y: number }) => void
  isSelected?: boolean
}

export function ConversationNode({
  node,
  onClick,
  onEmotionClick,
  onCreateBranch,
  onNodeDrag,
  isSelected = false,
}: ConversationNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  if (!node.isVisible) return null

  const handleClick = () => {
    if (onClick && !isDragging) {
      onClick(node)
    }
  }

  const handleEmotionClick = (emotion: { label: string; confidence: number }) => {
    if (onEmotionClick) {
      onEmotionClick(emotion.label)
    }
  }

  const handleCreateBranch = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCreateBranch) {
      onCreateBranch(node.id)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return

    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: 0, y: 0 })

    const handleMouseMove = (e: MouseEvent) => {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }
      setDragOffset(newOffset)
    }

    const handleMouseUp = () => {
      if (onNodeDrag && (Math.abs(dragOffset.x) > 5 || Math.abs(dragOffset.y) > 5)) {
        const newPosition = {
          x: node.position.x + dragOffset.x,
          y: node.position.y + dragOffset.y,
        }
        onNodeDrag(node.id, newPosition)
      }

      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const getRoleIcon = () => {
    return node.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />
  }

  const getRoleStyles = () => {
    return node.role === "user"
      ? "border-l-4 border-l-primary bg-card hover:bg-accent/50 dark:bg-card dark:hover:bg-accent/30"
      : "border-l-4 border-l-secondary bg-card hover:bg-muted/50 dark:bg-card dark:hover:bg-muted/30"
  }

  const truncateContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  return (
    <Card
      className={`
        conversation-node absolute transition-all duration-300
        ${getRoleStyles()}
        ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
        ${node.isHighlighted ? "ring-2 ring-yellow-400 ring-offset-2" : ""}
        ${isDragging ? "cursor-grabbing shadow-2xl scale-105 z-50" : "cursor-grab hover:shadow-lg"}
        dark:shadow-slate-900/50 dark:text-slate-100 dark:border-slate-600
      `}
      style={{
        left: node.position.x + dragOffset.x,
        top: node.position.y + dragOffset.y,
        width: "320px",
        height: "240px",
        animationDelay: `${node.animationDelay}ms`,
        zIndex: isDragging ? 50 : isSelected || isHovered ? 10 : 1,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute -top-2 -right-2 z-20">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 bg-card border-2 shadow-md hover:scale-110 transition-all duration-200 hover:bg-accent/50"
          onClick={handleCreateBranch}
          title="Create Branch"
        >
          <GitBranch className="h-3 w-3" />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              variant={node.role === "user" ? "default" : "secondary"}
              className={`text-xs font-medium ${
                node.role === "user"
                  ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                  : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
              }`}
            >
              {getRoleIcon()}
              <span className="ml-1 capitalize">{node.role === "user" ? "You" : "Assistant"}</span>
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              #{node.id}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{node.emotions.length} emotions</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 h-full overflow-hidden">
        <div className="space-y-3 h-full flex flex-col">
          {/* Message content */}
          <div className="text-sm text-foreground leading-relaxed dark:text-slate-200 flex-1 overflow-hidden">
            <div className={`${isHovered ? "line-clamp-none overflow-y-auto max-h-24" : "line-clamp-3"} break-words`}>
              {isHovered ? node.content : truncateContent(node.content)}
            </div>
          </div>

          {/* Emotions */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-muted-foreground dark:text-slate-400" />
              <span className="text-xs text-muted-foreground font-medium">Emotions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {node.emotions.map((emotion, index) => (
                <div
                  key={index}
                  className="text-xs bg-muted/70 text-muted-foreground px-2 py-0.5 rounded-sm hover:bg-accent/50 transition-colors"
                >
                  {emotion.label} {emotion.confidence}%
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
