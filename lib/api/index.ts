"use server"

import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"
import type { ApiOptions } from "./types"

const BASE_URL = process.env.GETME_API_URL

async function callGetMeApi<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  // Get JWT token directly from cookies (server-side only)
  const cookieStore = await cookies()

  // Get the session token from cookies
  const sessionToken =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value

  if (!sessionToken) {
    throw new Error("Not authenticated - no session token found")
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

  const accessToken = token?.accessToken
  if (!accessToken) {
    throw new Error("Not authenticated")
  }

  const { method = "GET", body, headers = {}, ...rest } = options

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...headers,
    },
    ...rest,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}

export { callGetMeApi }
