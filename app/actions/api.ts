"use server"

import { revalidatePath } from "next/cache"
import { callGetMeApi } from "@/lib/api"

/**
 * Fetches user data from the API using the centralized callGetMeApi utility.
 * The utility handles authentication and token management automatically.
 */
export async function fetchUserData<T>(): Promise<T> {
  try {
    return await callGetMeApi<T>("/users/me")
  } catch (error) {
    console.error("Error fetching user data:", error)
    throw error
  }
}

/**
 * Updates the user profile using the centralized callGetMeApi utility.
 * The utility handles authentication, token management, and request body serialization.
 */
export async function updateUserProfile<T>(data: {
  [key: string]: unknown
}): Promise<T> {
  try {
    const result = await callGetMeApi<T>("/users/me", {
      method: "PATCH",
      body: data,
    })

    // Revalidate the profile page to show updated data
    revalidatePath("/profile")

    return result
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}
