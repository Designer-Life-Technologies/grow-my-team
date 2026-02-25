import Credentials from "next-auth/providers/credentials"

import { resolveGetMeApiUrlFromHeaders } from "@/lib/api/getme-api-url"
import { logger } from "@/lib/utils/logger"

export const credentialsProvider = Credentials({
  name: "Credentials",
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" },
  },

  /**
   * Authenticates the user with the GetMe.video API.
   *
   * This function takes the user's credentials (username and password) and attempts
   * to exchange them for an access token from the `/auth/token` endpoint of the API.
   * If successful, it uses the obtained token to fetch the user's profile information
   * from the `/user` endpoint.
   *
   * @param credentials The user's username and password.
   * @returns On successful authentication, it returns a user object containing the user's
   *          ID, email, name, the API access token, and token expiration time.
   *          On any failure (e.g., invalid credentials, API errors, network issues),
   *          it logs the error and returns `null`.
   */
  async authorize(credentials, request) {
    if (!credentials?.username || !credentials?.password) {
      return null
    }

    try {
      const apiBase = await resolveGetMeApiUrlFromHeaders(request?.headers)
      // Make a request to the GetMe.video API token endpoint
      logger.info("Attempting to authorize with GetMe.video API...")
      const tokenUrl = new URL("/auth/token", apiBase).toString()
      logger.info(`API URL: ${tokenUrl}`)

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "password",
          username: credentials.username,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        logger.error(`API Error: ${response.status} ${response.statusText}`)
        logger.error("API Response Body:", errorBody)
        return null
      }

      const data = await response.json()
      logger.info("Token request successful: ", data)

      // Get user info from the API
      const userUrl = new URL("/user", apiBase).toString()
      const userResponse = await fetch(userUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
      })

      if (!userResponse.ok) {
        const errorBody = await userResponse.text()
        logger.error(
          `API Error: ${userResponse.status} ${userResponse.statusText}`,
        )
        logger.error("API Response Body:", errorBody)
        return null
      }

      const userData = await userResponse.json()
      logger.info("User info request successful: ", userData)

      // Attach the access token to the user object
      return {
        id: userData.id,
        email: credentials.username,
        firstname: userData.firstname,
        lastname: userData.lastname,
        organisations: userData.organisations || [],
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      }
    } catch (error) {
      logger.error("Network or other error during authorization:", error)
      return null
    }
  },
})
