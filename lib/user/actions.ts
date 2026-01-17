"use server"

import { safeCallGetMeApi } from "@/lib/api"
import type { RegisterUserResult, UserProfile } from "./types"

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const result = await safeCallGetMeApi<UserProfile>(`/user`)
  if (!result.success) throw new Error(result.error)
  return result.data
}

export async function getUserProfileById(id: string): Promise<UserProfile> {
  const result = await safeCallGetMeApi<UserProfile>(`/user/${id}`)
  if (!result.success) throw new Error(result.error)
  return result.data
}

/**
 * Create a new user (unauthenticated).
 * Calls POST /public/user with the provided payload.
 * On 200 returns { success: true }, otherwise returns { success: false, error, errorMessage }.
 */
export async function registerUser(
  input: UserProfile,
): Promise<RegisterUserResult> {
  const result = await safeCallGetMeApi<unknown>("/public/user", {
    method: "POST",
    body: input as unknown as Record<string, unknown>,
    public: true,
  })

  if (result.success) {
    return { success: true }
  }

  return {
    success: false,
    error: result.error || "registration_failed",
    errorMessage: result.error || "Registration failed",
  }
}
