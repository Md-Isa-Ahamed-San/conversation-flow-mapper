"use client"

import { useState } from "react"
import { FlowMapperClient } from "@/components/flow-mapper/FlowMapperClient"
import { ChatInterface } from "@/components/chat/ChatInterface"

type HomePageProps = {}

export function HomePage() {
  const [currentView, setCurrentView] = useState<"chat" | "flow">("chat")
  const [branchChat, setBranchChat] = useState<{ messages: any[]; isActive: boolean }>({
    messages: [],
    isActive: false,
  })

  const handleCreateBranch = (conversationHistory: string) => {
    const conversationArray = conversationHistory.split(", ").map((part) => {
      const [role, ...contentParts] = part.split(": ")
      return {
        role: role.trim(),
        content: contentParts.join(": ").trim(),
      }
    })

    const initialMessage = `This is the conversation we prev had: ${JSON.stringify(conversationArray, null, 2)} now continue from here`

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

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {currentView === "chat" ? (
          <ChatInterface
            onViewFlowMapper={() => setCurrentView("flow")}
            branchChat={branchChat}
            onCloseBranch={() => setBranchChat({ messages: [], isActive: false })}
          />
        ) : (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">Conversation Flow Mapper</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                Interactive visual flowchart showing the conversation flow with summarized assistant responses.
              </p>
              <button onClick={() => setCurrentView("chat")} className="text-primary hover:underline">
                ← Back to Chat
              </button>
            </div>
            <FlowMapperClient onCreateBranch={handleCreateBranch} />
          </div>
        )}
      </div>
    </main>
  )
}
