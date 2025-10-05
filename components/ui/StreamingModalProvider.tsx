"use client"

import * as React from "react"
import { type StreamingEvent, StreamingModal } from "./StreamingModal"

/**
 * StreamingModalProvider Context
 *
 * Provides global access to a streaming modal that can display real-time updates
 * from long-running API operations throughout the application.
 *
 * Usage:
 * 1. Wrap your app with <StreamingModalProvider>
 * 2. Use the useStreamingModal hook to access modal controls
 * 3. Call startStreaming() to open the modal and begin showing updates
 * 4. Call addEvent() to add new streaming events
 * 5. Call completeStreaming() when operation is done
 */

interface StreamingModalContextValue {
  /**
   * Start a new streaming operation and open the modal
   */
  startStreaming: (title: string, description?: string) => void
  /**
   * Add a new event to the streaming modal
   */
  addEvent: (message: string, type?: StreamingEvent["type"]) => void
  /**
   * Mark the streaming operation as complete
   * Modal can then be closed by the user
   */
  completeStreaming: () => void
  /**
   * Add an error event and mark as complete
   */
  errorStreaming: (message: string) => void
  /**
   * Clear all events and reset the modal
   */
  clearEvents: () => void
  /**
   * Whether a streaming operation is currently in progress
   */
  isProcessing: boolean
  /**
   * Whether the modal is currently open
   */
  isOpen: boolean
}

const StreamingModalContext = React.createContext<
  StreamingModalContextValue | undefined
>(undefined)

/**
 * Hook to access the streaming modal from anywhere in the app
 */
export function useStreamingModal() {
  const context = React.useContext(StreamingModalContext)
  if (!context) {
    throw new Error(
      "useStreamingModal must be used within a StreamingModalProvider",
    )
  }
  return context
}

interface StreamingModalProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that manages the global streaming modal state
 */
export function StreamingModalProvider({
  children,
}: StreamingModalProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState<string | undefined>()
  const [events, setEvents] = React.useState<StreamingEvent[]>([])
  const eventIdCounter = React.useRef(0)

  /**
   * Start a new streaming operation
   */
  const startStreaming = React.useCallback(
    (newTitle: string, newDescription?: string) => {
      setTitle(newTitle)
      setDescription(newDescription)
      setEvents([])
      setIsProcessing(true)
      setIsOpen(true)
      eventIdCounter.current = 0
    },
    [],
  )

  /**
   * Add a new event to the stream
   */
  const addEvent = React.useCallback(
    (message: string, type: StreamingEvent["type"] = "info") => {
      const newEvent: StreamingEvent = {
        id: `event-${eventIdCounter.current++}`,
        message,
        type,
        timestamp: new Date(),
      }
      setEvents((prev) => [...prev, newEvent])
    },
    [],
  )

  /**
   * Mark streaming as complete
   */
  const completeStreaming = React.useCallback(() => {
    setIsProcessing(false)
  }, [])

  /**
   * Add error event and mark as complete
   */
  const errorStreaming = React.useCallback(
    (message: string) => {
      addEvent(message, "error")
      setIsProcessing(false)
    },
    [addEvent],
  )

  /**
   * Clear all events and reset
   */
  const clearEvents = React.useCallback(() => {
    setEvents([])
    eventIdCounter.current = 0
  }, [])

  /**
   * Handle modal close
   */
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setIsOpen(false)
      // Clear events after a delay to allow modal close animation
      setTimeout(() => {
        setEvents([])
        eventIdCounter.current = 0
      }, 300)
    }
  }, [])

  const value = React.useMemo(
    () => ({
      startStreaming,
      addEvent,
      completeStreaming,
      errorStreaming,
      clearEvents,
      isProcessing,
      isOpen,
    }),
    [
      startStreaming,
      addEvent,
      completeStreaming,
      errorStreaming,
      clearEvents,
      isProcessing,
      isOpen,
    ],
  )

  return (
    <StreamingModalContext.Provider value={value}>
      {children}
      <StreamingModal
        open={isOpen}
        onOpenChange={handleOpenChange}
        title={title}
        description={description}
        events={events}
        isProcessing={isProcessing}
      />
    </StreamingModalContext.Provider>
  )
}
