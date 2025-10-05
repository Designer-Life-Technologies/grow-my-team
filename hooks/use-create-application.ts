import { useState } from "react"

export interface StreamingEvent {
  type: "info" | "success" | "error" | "progress" | "loading"
  message: string
}

export function useCreateApplication() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [events, setEvents] = useState<StreamingEvent[]>([])

  const createApplication = async (
    formData: FormData,
    onEvent?: (event: StreamingEvent) => void,
  ) => {
    setIsStreaming(true)
    setEvents([])

    try {
      const response = await fetch("/api/candidate/apply", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        const errorEvent: StreamingEvent = {
          type: "error",
          message: error.error || "Failed to submit application",
        }
        setEvents([errorEvent])
        onEvent?.(errorEvent)
        setIsStreaming(false)
        return { success: false, events: [errorEvent] }
      }

      if (!response.body) {
        const errorEvent: StreamingEvent = {
          type: "error",
          message: "No response body",
        }
        setEvents([errorEvent])
        onEvent?.(errorEvent)
        setIsStreaming(false)
        return { success: false, events: [errorEvent] }
      }

      // Process SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      const receivedEvents: StreamingEvent[] = []

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        let currentEvent = "message"
        let currentData = ""

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim()
          } else if (line.startsWith("data:")) {
            currentData = line.slice(5).trim()
          } else if (line === "") {
            if (currentData) {
              try {
                const data = JSON.parse(currentData)
                const streamEvent: StreamingEvent = {
                  type: currentEvent as StreamingEvent["type"],
                  message: data.message || currentData,
                }

                receivedEvents.push(streamEvent)
                setEvents((prev) => [...prev, streamEvent])
                onEvent?.(streamEvent)
              } catch {
                const streamEvent: StreamingEvent = {
                  type: currentEvent as StreamingEvent["type"],
                  message: currentData,
                }
                receivedEvents.push(streamEvent)
                setEvents((prev) => [...prev, streamEvent])
                onEvent?.(streamEvent)
              }

              currentEvent = "message"
              currentData = ""
            }
          }
        }
      }

      setIsStreaming(false)

      const hasError = receivedEvents.some((e) => e.type === "error")
      return {
        success: !hasError,
        events: receivedEvents,
      }
    } catch (error) {
      const errorEvent: StreamingEvent = {
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      }
      setEvents([errorEvent])
      onEvent?.(errorEvent)
      setIsStreaming(false)
      return { success: false, events: [errorEvent] }
    }
  }

  return {
    createApplication,
    isStreaming,
    events,
  }
}
