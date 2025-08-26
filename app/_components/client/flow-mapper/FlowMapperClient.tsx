"use client"

import { useCallback, useState, useEffect } from "react"
import type { FlowMapperClientProps, FlowNode, FlowConnection, Message } from "@/lib/types"
import { messages as initialMessages } from "@/lib/data"
import { FlowViewport } from "@/components/flow-mapper/FlowViewport"
import { calculateFlowLayout } from "@/lib/flow-calculator"

export function FlowMapperClient({
  onCreateBranch,
  messages: newMessages = [],
}: FlowMapperClientProps & { messages?: Message[] }) {
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [connections, setConnections] = useState<FlowConnection[]>([])
  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    scale: 1,
    width: 1200,
    height: 600,
  })
  const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>()

  useEffect(() => {
    const allMessages = newMessages.length > 0 ? newMessages : initialMessages

    const uniqueMessages = Array.from(new Map(allMessages.map((message) => [message.id, message])).values())

    const flowNodes: FlowNode[] = uniqueMessages.map((message, index) => ({
      id: message.id,
      type: message.role === "user" ? "user" : "assistant",
      role: message.role,
      content: message.content,
      emotions: message.emotions,
      position: { x: 0, y: 0 }, // Will be calculated by layout function
      isVisible: true,
      metadata: {
        timestamp: new Date().toISOString(),
        wordCount: message.content.split(" ").length,
      },
    }))

    const flowConnections: FlowConnection[] = []
    for (let i = 0; i < uniqueMessages.length - 1; i++) {
      flowConnections.push({
        from: uniqueMessages[i].id,
        to: uniqueMessages[i + 1].id,
        type: "conversation",
        strength: 1,
      })
    }

    // Calculate positions using the flow calculator
    const { nodes: layoutNodes } = calculateFlowLayout(flowNodes, flowConnections)

    setNodes(layoutNodes)
    setConnections(flowConnections)
  }, [newMessages]) // Added dependency on newMessages

  const handleCreateBranch = useCallback(
    (nodeId: number) => {
      if (!onCreateBranch) return

      onCreateBranch(nodeId.toString())
    },
    [onCreateBranch],
  )

  const handleNodeClick = useCallback((node: FlowNode) => {
    setSelectedNodeId(node.id)
  }, [])

  const handleViewportChange = useCallback((width: number, height: number) => {
    setViewport((prev) => ({ ...prev, width, height }))
  }, [])

  return (
    <div className="w-full">
      <FlowViewport
        nodes={nodes}
        connections={connections}
        viewport={viewport}
        onNodeClick={handleNodeClick}
        onViewportChange={handleViewportChange}
        onCreateBranch={handleCreateBranch}
        selectedNodeId={selectedNodeId}
      />
    </div>
  )
}
