import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Client-side session type
   * Note: accessToken is intentionally not included here as it should only be available server-side
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  /**
   * Raw user object received from authentication provider
   * Contains all user data including sensitive information
   */
  interface User {
    id: string
    email: string
    name: string
    accessToken: string
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
    name: string
    accessToken: string
  }
}
