"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Message = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("group relative flex items-start gap-3", className)} {...props} />
  ),
)
Message.displayName = "Message"

const MessageAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentPropsWithoutRef<typeof Avatar> & {
    src?: string
    alt?: string
    fallback?: string
    delayMs?: number
  }
>(({ className, src, alt, fallback, delayMs, ...props }, ref) => (
  <Avatar ref={ref} className={cn("h-8 w-8 shrink-0", className)} {...props}>
    {src && <AvatarImage src={src || "/placeholder.svg"} alt={alt} />}
    <AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>
  </Avatar>
))
MessageAvatar.displayName = "MessageAvatar"

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    markdown?: boolean
  }
>(({ className, children, markdown, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 space-y-2 overflow-hidden", className)} {...props}>
    {markdown ? <div className="prose prose-sm max-w-none dark:prose-invert">{children}</div> : children}
  </div>
))
MessageContent.displayName = "MessageContent"

const MessageActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100", className)}
      {...props}
    />
  ),
)
MessageActions.displayName = "MessageActions"

export { Message, MessageAvatar, MessageContent, MessageActions }
