/**
 * Generic streaming event type used for both API streaming and UI display
 *
 * @template T - Optional data payload type from the API
 */
export interface StreamingEvent<T = unknown> {
  /**
   * Event type/status
   */
  type: "info" | "success" | "error" | "progress" | "loading"
  /**
   * Event message to display
   */
  message: string
  /**
   * Optional data payload from the API
   */
  data?: T
  /**
   * Unique identifier for the event (used by UI components)
   */
  id?: string
  /**
   * Timestamp when event occurred (used by UI components for ordering)
   */
  timestamp?: Date
}
