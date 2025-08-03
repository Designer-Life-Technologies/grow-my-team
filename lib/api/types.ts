export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown>
}
