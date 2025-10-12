"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import * as React from "react"
import type { StreamingEvent } from "@/lib/types/streaming"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"

/**
 * StreamingModal Component
 *
 * A compact modal that displays real-time streaming updates from long-running API operations.
 * Updates are displayed in a scrolling list with fade-out effect for older items.
 *
 * Features:
 * - Real-time event streaming display
 * - Auto-scrolling to latest updates
 * - Fade-out effect for older messages
 * - Central spinner while processing
 * - Cannot be closed while operation is in progress
 */

interface StreamingModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean
  /**
   * Callback when modal should close (only called when operation is complete)
   */
  onOpenChange: (open: boolean) => void
  /**
   * Modal title
   */
  title: string
  /**
   * Modal description
   */
  description?: string
  /**
   * Array of streaming events to display
   */
  events: StreamingEvent[]
  /**
   * Whether the operation is still in progress
   */
  isProcessing: boolean
}

export function StreamingModal({
  open,
  onOpenChange,
  title,
  description,
  events,
  isProcessing,
}: StreamingModalProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const latestEvent = events.length > 0 ? events[events.length - 1] : undefined
  const progress =
    typeof latestEvent?.progress === "number"
      ? Math.max(0, Math.min(100, latestEvent.progress))
      : undefined

  // Auto-scroll to bottom when new events arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when events array changes
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  // Auto-close modal 1 second after success message
  React.useEffect(() => {
    if (!isProcessing && events.length > 0) {
      const lastEvent = events[events.length - 1]
      if (lastEvent.type === "success") {
        const timer = setTimeout(() => {
          onOpenChange(false)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [isProcessing, events, onOpenChange])

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Only allow closing if not processing
        if (!isProcessing) {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent
        className="max-w-md overflow-hidden p-0 border-0 [&>button]:hidden"
        onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside while processing
          if (isProcessing) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape key while processing
          if (isProcessing) {
            e.preventDefault()
          }
        }}
      >
        {isProcessing && (
          <div className="h-1 bg-muted overflow-hidden">
            <div className="h-full bg-primary animate-[progress_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        <div className="p-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-2">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="relative h-6 overflow-hidden border rounded bg-muted/20 mt-6 mb-4">
            {events.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Waiting for updates...
              </div>
            ) : (
              <div className="h-6 flex items-center justify-center text-xs px-3">
                {events[events.length - 1].type === "success" && (
                  <CheckCircle2 className="mr-1.5 inline-block h-3 w-3 text-green-600" />
                )}
                {events[events.length - 1].type === "error" && (
                  <XCircle className="mr-1.5 inline-block h-3 w-3 text-red-600" />
                )}
                <span
                  className={cn(
                    "truncate",
                    events[events.length - 1].type === "success" &&
                      "text-green-600",
                    events[events.length - 1].type === "error" &&
                      "text-red-600",
                  )}
                >
                  {events[events.length - 1].message}
                </span>
                {progress !== undefined && (
                  <span className="ml-2 text-[10px] text-muted-foreground">
                    {progress}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
