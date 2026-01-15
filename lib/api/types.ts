export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown>
}

export interface ApiResponse<T> {
  data: T
  serverNow?: string
}
