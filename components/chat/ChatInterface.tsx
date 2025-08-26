"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { messages } from "@/lib/data"
import { ArrowRight, Send, X } from "lucide-react"
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/ui/chat-container"
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message"

interface ChatInterfaceProps {
  onViewFlowMapper: () => void
  branchChat?: { messages: any[]; isActive: boolean }
  onCloseBranch?: () => void
}

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  emotions: Array<{ label: string; confidence: number }>
}

function EmotionBars({ emotions }: { emotions: Array<{ label: string; confidence: number }> }) {
  return (
    <div className="space-y-1 mt-2">
      {emotions.map((emotion) => (
        <div key={emotion.label} className="flex items-center gap-2 text-xs opacity-60">
          <span className="text-muted-foreground min-w-[60px] text-[10px]">{emotion.label}</span>
          <div className="flex-1 bg-muted rounded-full h-0.5 overflow-hidden max-w-[80px]">
            <div
              className={`h-full transition-all duration-300 ${
                emotion.confidence >= 80 ? "bg-red-400" : emotion.confidence >= 60 ? "bg-yellow-400" : "bg-green-400"
              }`}
              style={{ width: `${emotion.confidence}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground min-w-[25px]">{emotion.confidence}%</span>
        </div>
      ))}
    </div>
  )
}

const randomResponses = [
  "That's a great question! Let me help you with that.",
  "I understand your concern. Here's what I would suggest...",
  "Excellent point! You're thinking about this the right way.",
  "That's a common challenge. Here's how you can approach it:",
  "Good observation! Let me provide some clarity on that.",
  "I see what you're getting at. Here's my perspective:",
]

export function ChatInterface({ onViewFlowMapper, branchChat, onCloseBranch }: ChatInterfaceProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (branchChat?.isActive && branchChat.messages.length > 0) {
      setChatMessages(branchChat.messages)
    } else {
      setChatMessages(messages)
    }
  }, [branchChat])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newUserMessage: ChatMessage = {
      id: chatMessages.length + 1,
      role: "user",
      content: inputValue,
      emotions: [
        { label: "Curiosity", confidence: Math.floor(Math.random() * 30) + 70 },
        { label: "Engagement", confidence: Math.floor(Math.random() * 20) + 60 },
      ],
    }

    const randomResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)]
    const newAssistantMessage: ChatMessage = {
      id: chatMessages.length + 2,
      role: "assistant",
      content: randomResponse,
      emotions: [
        { label: "Helpfulness", confidence: Math.floor(Math.random() * 20) + 80 },
        { label: "Clarity", confidence: Math.floor(Math.random() * 15) + 75 },
      ],
    }

    setChatMessages([...chatMessages, newUserMessage, newAssistantMessage])
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{branchChat?.isActive ? "Branch Chat" : "Chat Conversation"}</h1>
            <p className="text-sm text-muted-foreground">
              {branchChat?.isActive ? "Continuing from conversation branch" : "React state management discussion"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {branchChat?.isActive && onCloseBranch && (
              <Button onClick={onCloseBranch} variant="outline" size="sm" className="gap-2 bg-transparent">
                <X className="w-4 h-4" />
                Close Branch
              </Button>
            )}
            <Button onClick={onViewFlowMapper} variant="outline" className="gap-2 bg-transparent">
              View Flow Mapper <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ChatContainerRoot className="flex-1">
        <ChatContainerContent className="max-w-4xl mx-auto">
          {chatMessages.map((message) => (
            <Message key={message.id} className={`${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <MessageAvatar
                fallback={message.role === "user" ? "U" : "AI"}
                className={`${message.role === "user" ? "bg-muted text-muted-foreground" : "bg-blue-500 text-white"}`}
              />

              <MessageContent className={`${message.role === "user" ? "mr-4" : "ml-0"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                    message.role === "user" ? "bg-muted ml-auto text-right" : "bg-muted/50"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                </div>

                {message.emotions.length > 0 && <EmotionBars emotions={message.emotions} />}
              </MessageContent>
            </Message>
          ))}
        </ChatContainerContent>
        <ChatContainerScrollAnchor />
      </ChatContainerRoot>

      <div className="border-t bg-background p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm" className="gap-2">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
