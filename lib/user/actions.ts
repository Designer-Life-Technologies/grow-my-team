"use server"

import { callGetMeApi } from "@/lib/api"
import type { UserProfile } from "./types"

export async function getCurrentUserProfile(): Promise<UserProfile> {
  try {
    const user = await callGetMeApi<UserProfile>(`/user`)
    return user
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

export async function getUserProfileById(id: string): Promise<UserProfile> {
  try {
    const user = await callGetMeApi<UserProfile>(`/user/${id}`)
    return user
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}
