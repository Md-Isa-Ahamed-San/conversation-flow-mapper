"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input"
import { Send, Eye, X } from "lucide-react"
import { messages as initialMessages } from "@/lib/data"

interface ChatInterfaceProps {
  onViewFlowMapper: () => void
  branchChat?: { messages: any[]; isActive: boolean }
  onCloseBranch?: () => void
  onNewMessage?: (message: ChatMessage) => void
  currentMessages?: ChatMessage[]
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
          <span className="text-foreground min-w-[60px] text-[10px]">{emotion.label}</span>
          <div className="flex-1 bg-muted rounded-full h-0.5 overflow-hidden max-w-[80px]">
            <div
              className={`h-full transition-all duration-300 ${
                emotion.confidence >= 80 ? "bg-red-400" : emotion.confidence >= 60 ? "bg-yellow-400" : "bg-green-400"
              }`}
              style={{ width: `${emotion.confidence}%` }}
            />
          </div>
          <span className="text-[10px] text-foreground min-w-[25px]">{emotion.confidence}%</span>
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

export function ChatInterface({
  onViewFlowMapper,
  branchChat,
  onCloseBranch,
  onNewMessage,
  currentMessages,
}: ChatInterfaceProps) {
  const [mainMessages, setMainMessages] = useState<ChatMessage[]>(currentMessages || initialMessages)
  const [branchMessages, setBranchMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasGeneratedBranchResponse, setHasGeneratedBranchResponse] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const displayMessages = branchChat?.isActive ? branchMessages : mainMessages

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [displayMessages])

  useEffect(() => {
    if (currentMessages && !branchChat?.isActive) {
      setMainMessages(currentMessages)
    }
  }, [currentMessages, branchChat?.isActive])

  useEffect(() => {
    if (branchChat?.isActive && branchChat.messages.length > 0) {
      setBranchMessages(branchChat.messages)
      const lastMessage = branchChat.messages[branchChat.messages.length - 1]
      if (lastMessage.role === "user" && !hasGeneratedBranchResponse) {
        setHasGeneratedBranchResponse(true)
        setIsLoading(true)
        setTimeout(
          () => {
            const assistantMessage: ChatMessage = {
              id: Date.now() + 1,
              role: "assistant",
              content: randomResponses[Math.floor(Math.random() * randomResponses.length)],
              emotions: [
                { label: "Confident", confidence: Math.floor(Math.random() * 30) + 70 },
                { label: "Helpful", confidence: Math.floor(Math.random() * 25) + 75 },
                { label: "Engaged", confidence: Math.floor(Math.random() * 20) + 80 },
              ],
            }
            setBranchMessages((prev) => [...prev, assistantMessage])
            setIsLoading(false)
          },
          1000 + Math.random() * 2000,
        )
      }
    } else if (!branchChat?.isActive) {
      setHasGeneratedBranchResponse(false)
      setBranchMessages([])
    }
  }, [branchChat, hasGeneratedBranchResponse])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const generateUserEmotions = (content: string) => {
      const emotions = []
      if (content.includes("?")) emotions.push({ label: "Curiosity", confidence: Math.floor(Math.random() * 20) + 70 })
      if (content.includes("help") || content.includes("please"))
        emotions.push({ label: "Seeking Help", confidence: Math.floor(Math.random() * 15) + 75 })
      if (content.includes("!")) emotions.push({ label: "Excitement", confidence: Math.floor(Math.random() * 25) + 60 })
      if (emotions.length === 0) emotions.push({ label: "Neutral", confidence: Math.floor(Math.random() * 20) + 50 })
      return emotions
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue.trim(),
      emotions: generateUserEmotions(inputValue.trim()),
    }

    if (branchChat?.isActive) {
      setBranchMessages((prev) => [...prev, userMessage])
    } else {
      setMainMessages((prev) => [...prev, userMessage])
      onNewMessage?.(userMessage)
    }

    setInputValue("")
    setIsLoading(true)

    setTimeout(
      () => {
        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: randomResponses[Math.floor(Math.random() * randomResponses.length)],
          emotions: [
            { label: "Confident", confidence: Math.floor(Math.random() * 30) + 70 },
            { label: "Helpful", confidence: Math.floor(Math.random() * 25) + 75 },
            { label: "Engaged", confidence: Math.floor(Math.random() * 20) + 80 },
          ],
        }

        if (branchChat?.isActive) {
          setBranchMessages((prev) => [...prev, assistantMessage])
        } else {
          setMainMessages((prev) => [...prev, assistantMessage])
          onNewMessage?.(assistantMessage)
        }
        setIsLoading(false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Chat Interface</h2>
          {branchChat?.isActive && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Branch Chat Active</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFlowMapper}
            className="flex items-center gap-2 bg-transparent"
          >
            <Eye className="h-4 w-4" />
            View Flow
          </Button>
          {branchChat?.isActive && onCloseBranch && (
            <Button variant="ghost" size="sm" onClick={onCloseBranch} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Close Branch
            </Button>
          )}
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {displayMessages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[80%] p-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.emotions.length > 0 && <EmotionBars emotions={message.emotions} />}
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-3 bg-card">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                  Thinking...
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <PromptInput
          value={inputValue}
          onValueChange={setInputValue}
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          className="w-full"
        >
          <PromptInputActions>
            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </PromptInputActions>
        </PromptInput>
        <div className="mt-2 text-xs text-foreground">Press Enter to send, Shift+Enter for new line</div>
      </div>
    </div>
  )
}
