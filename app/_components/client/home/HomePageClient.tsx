"use client"

import { useState } from "react"
import { FlowMapperClient } from "@/app/_components/client/flow-mapper/FlowMapperClient"
import { ChatInterface } from "@/app/_components/client/chat/ChatInterface"
import { HomePageLayout } from "@/app/_components/server/home/HomePageLayout"
import type { Message } from "@/lib/types"
import { messages as initialMessages } from "@/lib/data"

export function HomePageClient() {
  const [currentView, setCurrentView] = useState<"chat" | "flow">("chat")
  const [allMessages, setAllMessages] = useState<Message[]>(initialMessages)
  const [branchChat, setBranchChat] = useState<{ messages: any[]; isActive: boolean }>({
    messages: [],
    isActive: false,
  })

  const handleNewMessage = (message: Message) => {
    setAllMessages((prev) => [...prev, message])
  }

  const handleCreateBranch = (nodeId: string) => {
    // Find the node and extract conversation history up to that point
    const nodeIndex = allMessages.findIndex((msg) => msg.id.toString() === nodeId)
    const conversationHistory = nodeIndex >= 0 ? allMessages.slice(0, nodeIndex + 1) : allMessages

    // Format the conversation history as JSON
    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const initialMessage = `This is our previous conversation: ${JSON.stringify(formattedHistory, null, 2)}. Let's continue.`

    setBranchChat({
      messages: [
        {
          id: Date.now(),
          role: "user",
          content: initialMessage,
          emotions: [
            { label: "Curiosity", confidence: 75 },
            { label: "Engagement", confidence: 68 },
          ],
        },
      ],
      isActive: true,
    })
    setCurrentView("chat")
  }

  if (currentView === "chat") {
    return (
      <HomePageLayout title="Chat" description="Interactive chat interface">
        <ChatInterface
          onViewFlowMapper={() => setCurrentView("flow")}
          branchChat={branchChat}
          onCloseBranch={() => setBranchChat({ messages: [], isActive: false })}
          onNewMessage={handleNewMessage}
          currentMessages={allMessages}
        />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout
      title="Conversation Flow Mapper"
      description="Interactive visual flowchart showing the conversation flow with summarized assistant responses."
      showBackButton={true}
    >
      <div className="text-center mb-8">
        <button onClick={() => setCurrentView("chat")} className="text-primary hover:underline">
          ← Back to Chat
        </button>
      </div>
      <FlowMapperClient onCreateBranch={handleCreateBranch} messages={allMessages} />
    </HomePageLayout>
  )
}
