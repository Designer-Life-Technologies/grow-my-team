"use server"

import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"
import type { ApiOptions, ApiResponse } from "./types"

const BASE_URL = process.env.GETME_API_URL

type GetMeApiError = Error & { status?: number }

async function callGetMeApi<T>(
  path: string,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> {
  // Get JWT token directly from cookies (server-side only)
  const cookieStore = await cookies()
  let accessToken: string | undefined

  if (!options.public) {
    // Get the session token from cookies
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value

    if (!sessionToken) {
      const error = new Error(
        "Not authenticated - no session token found",
      ) as GetMeApiError
      error.status = 401
      throw error
    }

    // Decode the JWT token to get the access token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      throw new Error("NEXTAUTH_SECRET environment variable is not configured")
    }
    const token = await decode({
      token: sessionToken,
      secret,
    })

    if (!token) {
      const error = new Error("Invalid session") as GetMeApiError
      error.status = 401
      throw error
    }

    accessToken = token.accessToken as string | undefined

    if (!accessToken) {
      console.warn(`[callGetMeApi] No access token found for path: ${path}`)
      const error = new Error("Not authenticated") as GetMeApiError
      error.status = 401
      throw error
    }
  }

  const {
    method = "GET",
    body,
    headers = {},
    cache,
    public: _public,
    ...rest
  } = options

  // Prepare headers
  const apiHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (accessToken) {
    apiHeaders.Authorization = `Bearer ${accessToken}`
    apiHeaders["access-token"] = accessToken
  }

  // Safely merge existing headers from options
  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        apiHeaders[key] = value
      })
    } else if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        apiHeaders[key] = value
      }
    } else {
      // Safely merge object headers
      const headersObj = headers as Record<string, string>
      for (const key of Object.keys(headersObj)) {
        apiHeaders[key] = headersObj[key]
      }
    }
  }

  const config: RequestInit = {
    method,
    headers: apiHeaders,
    cache: cache ?? "no-store", // Prevent stale GET responses unless overridden
    ...rest,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const fullUrl = `${BASE_URL}${path}`
  console.log(`[GetMeAPI] ${method} ${fullUrl}`)

  const response = await fetch(fullUrl, config)

  // Get server time from Date header
  const serverNow = response.headers.get("Date") || undefined

  if (!response.ok) {
    let errorData: unknown = {}
    try {
      errorData = await response.json()
    } catch (_e) {
      try {
        errorData = { text: await response.text() }
      } catch (_e2) {
        errorData = { message: "Could not read error response" }
      }
    }

    const typedErrorData = errorData as Record<string, unknown>
    const message =
      (typedErrorData.error as Record<string, string>)?.error_message ||
      (typedErrorData.detail as string) ||
      (typedErrorData.message as string) ||
      `HTTP error! status: ${response.status}`

    console.error(`[GetMeAPI] ${method} ${fullUrl} Error: ${response.status}`, {
      message,
      errorData,
    })

    const error = new Error(message) as GetMeApiError
    error.status = response.status
    throw error
  }

  const data = (await response.json()) as T
  return {
    data,
    serverNow: serverNow ? new Date(serverNow).toISOString() : undefined,
  }
}

import type { SafeApiResult } from "./types"

/**
 * Safe wrapper for callGetMeApi that uses the Result pattern.
 * Returns { success: true, data } or { success: false, error }.
 * Never throws.
 */
export async function safeCallGetMeApi<T>(
  path: string,
  options: ApiOptions = {},
): Promise<SafeApiResult<T>> {
  try {
    const response = await callGetMeApi<T>(path, options)
    return {
      success: true,
      data: response.data,
      serverNow: response.serverNow,
    }
  } catch (error) {
    // Log is handled in callGetMeApi for API errors, or here for other errors
    const status = (error as GetMeApiError).status
    const message =
      error instanceof Error ? error.message : "Unknown error occurred"

    // If it's a 404, we might not want to log it as an error in some cases,
    // but the inner call already logged it.

    return {
      success: false,
      error: message,
      status,
    }
  }
}

export { callGetMeApi }
