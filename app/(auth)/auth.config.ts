import type { NextAuthOptions, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * JWT Callback - Called whenever a JSON Web Token is created (on sign in)
     * or updated (on session access). The returned value will be encrypted and
     * stored in a cookie.
     *
     * This callback runs when a JWT is created or updated. It's used to transfer
     * user properties from the authentication response to the token that will be
     * stored in the session. This ensures user data like ID and access token
     * persist across requests.
     *
     * @param token - The JWT being created/updated
     * @param user - The user object from the `authorize` callback (only available on sign in)
     * @returns Modified token with user properties
     */
    jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.accessToken = user.accessToken
      }
      return token
    },

    /**
     * Session Callback - Called whenever a session is created or updated.
     * The returned value will be stored in the session cookie.
     *
     * This callback runs when a session is created or updated. It's used to
     * transfer user properties from the token to the session.
     *
     * SECURITY NOTE: We only expose non-sensitive user data to the client.
     * The access token is kept in the JWT but NOT added to the client-side session.
     * This ensures sensitive data is only available to server components, API routes,
     * and server actions.
     *
     * @param session - The session being created/updated
     * @param token - The JWT token containing user properties
     * @returns Modified session with only safe user properties for client use
     */
    session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        // Safe properties for client-side use
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string

        // Note: accessToken is intentionally not added to session.user
        // It remains in the JWT token which is only accessible server-side
      }
      return session
    },
  },

  /**
   * Providers - Configure authentication providers.
   *
   * This section defines the authentication providers used by Next-Auth.
   * In this case, we're using a custom credentials provider for username/password
   * authentication. The provider is configured to use the `authorize` callback
   * for authentication.
   *
   * @param credentials - The credentials object containing username and password
   * @returns User object with access token if authentication is successful
   */
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Make a request to the GetMe.video API token endpoint
          const response = await fetch(`${process.env.GETME_API_URL}/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()

          // Return user object with access token
          return {
            id: data.user_id || data.id || "user-id",
            name: data.name || credentials.username,
            email: data.email || `${credentials.username}@example.com`,
            accessToken: data.access_token,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
}
