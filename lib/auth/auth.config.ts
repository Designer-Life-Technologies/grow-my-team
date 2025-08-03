import type { NextAuthOptions } from "next-auth"
import { credentialsProvider } from "./providers/credentials"

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        // Add user data to the token
        token.id = user.id
        token.email = user.email
        token.firstname = user.firstname
        token.accessToken = user.accessToken
        token.expiresIn = user.expiresIn

        // Add expiration time to the token
        if (user.expiresIn) {
          token.expires = Math.floor(Date.now() / 1000) + user.expiresIn
        }

        // Add organisation data to the token
        // CUrrent the first organisation will be added, this can be replaced
        // with use selection in the future
        if (user.organisations && user.organisations.length > 0) {
          token.organisation = {
            id: user.organisations[0].organisation.id,
            name: user.organisations[0].organisation.name,
            roles: user.organisations[0].roles,
          }
        }
        return token
      }

      // Return previous token if the access token has not expired yet
      if (token.expires && Date.now() < token.expires * 1000) {
        return token
      }

      // TODO: Access token has expired, try to update it using a refresh token.
      // For now, we return the expired token. A real app would handle token refresh.
      return token
    },

    /**
     * Session callback
     *
     * Returns the session object with the user data from the token.
     * Used by client components to access the user data and check if user is authenticated.
     *
     * @param session - The session object.
     * @param token - The token object.
     *
     * @returns Session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.firstname
        session.user.email = token.email
      }

      if (token.organisation) {
        session.organisation = token.organisation
      }

      if (token.expires) {
        session.expires = new Date(token.expires * 1000).toISOString()
      }
      return session
    },
  },
  providers: [credentialsProvider],
}
