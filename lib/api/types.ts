export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown>
  /**
   * If true, skips authentication checks (no Bearer token).
   * @default false
   */
  public?: boolean
  /**
   * Optional host override used for tenant-aware API resolution.
   * When omitted, the resolver infers the host from the current request context.
   */
  host?: string | null
}

export interface ApiResponse<T> {
  data: T
  serverNow?: string
}

export type SafeApiResult<T> =
  | { success: true; data: T; serverNow?: string }
  | { success: false; error: string; status?: number }
