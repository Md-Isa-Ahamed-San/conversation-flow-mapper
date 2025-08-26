"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ChatContainerRoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-full w-full flex-col overflow-hidden", className)} {...props} />
  ),
)
ChatContainerRoot.displayName = "ChatContainerRoot"

const ChatContainerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto px-4 py-6 space-y-6", className)} {...props} />
  ),
)
ChatContainerContent.displayName = "ChatContainerContent"

const ChatContainerScrollAnchor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("h-px w-full", className)} {...props} />,
)
ChatContainerScrollAnchor.displayName = "ChatContainerScrollAnchor"

export { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor }
