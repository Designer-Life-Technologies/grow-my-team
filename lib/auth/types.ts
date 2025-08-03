// import type { DefaultSession } from "next-auth"

import type { DefaultSession } from "next-auth"
import type { UserOrganisationRoles } from "@/lib/user/types"

declare module "next-auth" {
  /**
   * Client-side session type
   * Note: accessToken is intentionally not included here as it should only be available server-side
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
    organisation?: {
      id: string
      name: string
      roles: UserOrganisationRoles[]
    }
    expires: string
  }

  /**
   * Raw user object received from authentication provider
   * Contains all user data including sensitive information
   */

  interface Organisation {
    id: string
    name: string
  }

  interface User {
    id: string
    email: string
    firstname: string
    organisations?: {
      organisation: Organisation
      roles: [UserOrganisationRoles]
    }[]
    accessToken: string
    expiresIn?: number
  }
}

declare module "next-auth/jwt" {
  /**
   * JWT token stored in the session cookie
   * Contains all user data including sensitive information
   * Only accessible server-side
   */
  interface JWT {
    id: string
    email: string
    firstname: string
    accessToken: string
    expires?: number
    organisation?: {
      id: string
      name: string
      roles: [UserOrganisationRoles]
    }
  }
}
