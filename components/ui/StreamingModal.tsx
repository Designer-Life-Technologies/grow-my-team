"use client"

import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react"
import * as React from "react"
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
 * A modal that displays real-time streaming updates from long-running API operations.
 * Updates are displayed in a scrollable list with timestamps and status indicators.
 *
 * Features:
 * - Real-time event streaming display
 * - Auto-scrolling to latest updates
 * - Status indicators (loading, success, error, info)
 * - Timestamp for each event
 * - Cannot be closed while operation is in progress
 * - Automatic cleanup on completion
 */

export interface StreamingEvent {
  /**
   * Unique identifier for the event
   */
  id: string
  /**
   * Event message to display
   */
  message: string
  /**
   * Event type/status
   */
  type: "info" | "success" | "error" | "loading" | "progress"
  /**
   * Timestamp when event occurred
   */
  timestamp: Date
}

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

  // Auto-scroll to bottom when new events arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when events array changes
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  /**
   * Get icon component based on event type
   */
  const getEventIcon = (type: StreamingEvent["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "progress":
        return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  /**
   * Format timestamp for display
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

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
        className="max-w-2xl"
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Events container */}
        <div
          ref={scrollRef}
          className="max-h-96 space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-4"
        >
          {events.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Waiting for updates...
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-3 rounded-md border bg-background p-3 transition-all",
                  event.type === "error" && "border-red-200 bg-red-50/50",
                  event.type === "success" && "border-green-200 bg-green-50/50",
                )}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-relaxed">{event.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Complete
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {events.length} {events.length === 1 ? "update" : "updates"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
