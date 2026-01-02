"use server"

import { callGetMeApi } from "@/lib/api"
import { logger } from "@/lib/utils/logger"
import type { RegisterUserResult, UserProfile } from "./types"

export async function getCurrentUserProfile(): Promise<UserProfile> {
  try {
    const response = await callGetMeApi<UserProfile>(`/user`)
    return response.data
  } catch (error) {
    logger.error("Error fetching user profile:", error)
    throw error
  }
}

export async function getUserProfileById(id: string): Promise<UserProfile> {
  try {
    const response = await callGetMeApi<UserProfile>(`/user/${id}`)
    return response.data
  } catch (error) {
    logger.error("Error fetching user profile:", error)
    throw error
  }
}

/**
 * Create a new user (unauthenticated).
 * Calls POST /public/user with the provided payload.
 * On 200 returns { success: true }, otherwise returns { success: false, error, errorMessage }.
 */
export async function registerUser(
  input: UserProfile,
): Promise<RegisterUserResult> {
  try {
    const baseUrl = process.env.GETME_API_URL

    const response = await fetch(`${baseUrl}/v1/public/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })

    if (response.ok) {
      return { success: true }
    }

    // Attempt to parse structured error from API
    const data = (await response.json().catch(() => ({}))) as {
      error?: string
      error_message?: string
      detail?: string
    }

    return {
      success: false,
      error: data.error || `http_${response.status}`,
      errorMessage: data.error_message || data.detail || "Registration failed",
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return {
      success: false,
      error: "network_error",
      errorMessage: message,
    }
  }
}
