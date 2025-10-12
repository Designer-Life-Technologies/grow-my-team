import { useState } from "react"
import type { Applicant } from "@/lib/candidate/types"
import type { StreamingEvent } from "@/lib/types/streaming"

export function useCreateApplicant() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [events, setEvents] = useState<StreamingEvent<Applicant>[]>([])

  const createApplicant = async (
    formData: FormData,
    onEvent?: (event: StreamingEvent<Applicant>) => void,
  ) => {
    setIsStreaming(true)
    setEvents([])

    try {
      // Call the next.js api route, which is just a proxy for the GMT API route
      // This is done to allow for streaming responses from the GMT API
      const response = await fetch("/api/candidate/create", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        const errorEvent: StreamingEvent<Applicant> = {
          type: "error",
          message: error.error || "Failed to submit application",
        }
        setEvents([errorEvent])
        onEvent?.(errorEvent)
        setIsStreaming(false)
        return { success: false, events: [errorEvent] }
      }

      if (!response.body) {
        const errorEvent: StreamingEvent<Applicant> = {
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
      const receivedEvents: StreamingEvent<Applicant>[] = []
      let applicantData: Applicant | null = null

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
                console.log("📦 SSE Data received:", data)

                const progressValue =
                  typeof data.progress === "number"
                    ? Math.max(0, Math.min(100, data.progress))
                    : undefined

                const streamEvent: StreamingEvent<Applicant> = {
                  type: currentEvent as StreamingEvent<Applicant>["type"],
                  message: data.message || currentData,
                  progress: progressValue,
                  data: data.data,
                }

                // Capture applicant data from success event
                if (currentEvent === "success" && data.data) {
                  applicantData = data.data as Applicant
                }

                receivedEvents.push(streamEvent)
                setEvents((prev) => [...prev, streamEvent])
                onEvent?.(streamEvent)
              } catch {
                const streamEvent: StreamingEvent<Applicant> = {
                  type: currentEvent as StreamingEvent<Applicant>["type"],
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
        applicant: applicantData,
      }
    } catch (error) {
      const errorEvent: StreamingEvent<Applicant> = {
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
    createApplicant,
    isStreaming,
    events,
  }
}
