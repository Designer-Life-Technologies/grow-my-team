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
  /**
   * Optional theme parameter to use for API endpoint resolution.
   * When provided, the resolver will use the theme-specific API endpoint from the database.
   */
  theme?: string | null
  /**
   * Optional explicit API endpoint to use.
   * When provided, overrides the default resolution logic.
   */
  apiEndpoint?: string
}

export interface ApiResponse<T> {
  data: T
  serverNow?: string
}

export type SafeApiResult<T> =
  | { success: true; data: T; serverNow?: string }
  | { success: false; error: string; status?: number }
