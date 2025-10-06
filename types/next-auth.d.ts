import type { DefaultSession } from "next-auth"
import type { Phone } from "@/lib/types/base"

/**
 * Module augmentation for NextAuth types
 * Extends the default Session and JWT types to include custom user data
 */
declare module "next-auth" {
  /**
   * User type returned from authorize() and stored in JWT
   */
  interface User {
    id: string
    email: string
    firstname?: string
    lastname?: string
    organisations?: Array<{
      organisation: {
        id: string
        name: string
      }
      roles: string[]
    }>
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
    // User type discriminator
    userType?: "staff" | "applicant"
    // Applicant-specific fields (only what's not already in User)
    mobile?: Phone
    linkedInUrl?: string
  }

  /**
   * Session type available on the client
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      userType?: "staff" | "applicant"
      // Applicant-specific fields available in session
      mobile?: Phone
      linkedInUrl?: string
    } & DefaultSession["user"]
    organisation?: {
      id: string
      name: string
      roles: string[]
    }
    expires: string
  }
}

declare module "next-auth/jwt" {
  /**
   * JWT token type stored server-side
   */
  interface JWT {
    id: string
    email?: string
    firstname?: string
    lastname?: string
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
    expires?: number
    organisation?: {
      id: string
      name: string
      roles: string[]
    }
    // User type discriminator
    userType?: "staff" | "applicant"
    // Applicant-specific fields
    mobile?: Phone
    linkedInUrl?: string
  }
}
