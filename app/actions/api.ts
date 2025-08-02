"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { authConfig } from "../(auth)/auth.config"

/**
 * Example server action that fetches user data from an API
 * using the access token stored in the server-side session
 */
export async function fetchUserData() {
  const session = await getServerSession(authConfig)

  // Access token is only available server-side
  // We need to get it from the raw session token
  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // In server actions, we need to get the JWT token to access the accessToken
    // The accessToken is stored in the JWT, not in the session for security
    const token = await getToken({
      req: {
        headers: {
          cookie: cookies().toString(),
        },
        // biome-ignore lint/suspicious/noExplicitAny: Required for server actions
      } as any,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.accessToken) {
      throw new Error("Access token not found")
    }

    // Now we can use the access token to make authenticated API requests
    const response = await fetch(`${process.env.GETME_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user data")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching user data:", error)
    throw error
  }
}

/**
 * Example server action that updates user profile
 * using the access token stored in the server-side session
 */
export async function updateUserProfile(data: { name?: string; bio?: string }) {
  const session = await getServerSession(authConfig)

  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // In server actions, we need to get the JWT token to access the accessToken
    // The accessToken is stored in the JWT, not in the session for security
    const token = await getToken({
      req: {
        headers: {
          cookie: cookies().toString(),
        },
        // biome-ignore lint/suspicious/noExplicitAny: Required for server actions
      } as any,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.accessToken) {
      throw new Error("Access token not found")
    }

    const response = await fetch(`${process.env.GETME_API_URL}/user/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update profile")
    }

    // Revalidate the profile page to show updated data
    revalidatePath("/profile")

    return response.json()
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}
