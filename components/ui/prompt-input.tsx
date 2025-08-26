"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

const PromptInput = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement> & {
    isLoading?: boolean
    value?: string
    onValueChange?: (value: string) => void
    maxHeight?: number | string
    onSubmit?: () => void
  }
>(({ className, isLoading, value, onValueChange, maxHeight = 240, onSubmit, children, ...props }, ref) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading && onSubmit) {
      onSubmit()
    }
  }

  return (
    <form ref={ref} className={cn("relative flex flex-col gap-2", className)} onSubmit={handleSubmit} {...props}>
      <div className="relative">
        <PromptInputTextarea
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          maxHeight={maxHeight}
          disabled={isLoading}
        />
        {children}
      </div>
    </form>
  )
})
PromptInput.displayName = "PromptInput"

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea> & {
    disableAutosize?: boolean
    maxHeight?: number | string
  }
>(({ className, disableAutosize, maxHeight = 240, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useImperativeHandle(ref, () => textareaRef.current!)

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return

    const textarea = textareaRef.current
    textarea.style.height = "auto"
    const scrollHeight = textarea.scrollHeight
    const maxHeightPx = typeof maxHeight === "number" ? maxHeight : Number.parseInt(maxHeight)
    textarea.style.height = `${Math.min(scrollHeight, maxHeightPx)}px`
  }, [props.value, disableAutosize, maxHeight])

  return <Textarea ref={textareaRef} className={cn("min-h-[60px] resize-none", className)} {...props} />
})
PromptInputTextarea.displayName = "PromptInputTextarea"

const PromptInputActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("absolute bottom-2 right-2 flex items-center gap-1", className)} {...props} />
  ),
)
PromptInputActions.displayName = "PromptInputActions"

export { PromptInput, PromptInputTextarea, PromptInputActions }
