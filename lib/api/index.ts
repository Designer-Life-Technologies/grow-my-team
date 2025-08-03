"use server"

import { cookies } from "next/headers"
import { getToken } from "next-auth/jwt"
import type { ApiOptions } from "./types"

const BASE_URL = process.env.GETME_API_URL

async function callGetMeApi<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  // Get JWT token directly from cookies (server-side only)
  const cookieStore = await cookies()
  const token = await getToken({
    req: {
      cookies: Object.fromEntries(
        cookieStore.getAll().map((cookie) => [cookie.name, cookie.value]),
      ),
    } as unknown as Request,
    secret: process.env.NEXTAUTH_SECRET,
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
