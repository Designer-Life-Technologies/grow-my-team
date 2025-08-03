import Credentials from "next-auth/providers/credentials"

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
  async authorize(credentials) {
    if (!credentials?.username || !credentials?.password) {
      return null
    }

    try {
      // Make a request to the GetMe.video API token endpoint
      console.log("Attempting to authorize with GetMe.video API...")
      console.log(`API URL: ${process.env.GETME_API_URL}/auth/token`)

      const response = await fetch(`${process.env.GETME_API_URL}/auth/token`, {
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
        console.error(`API Error: ${response.status} ${response.statusText}`)
        console.error("API Response Body:", errorBody)
        return null
      }

      const data = await response.json()
      console.log("Token request successful: ", data)

      // Get user info from the API
      const userResponse = await fetch(`${process.env.GETME_API_URL}/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
      })

      if (!userResponse.ok) {
        const errorBody = await userResponse.text()
        console.error(
          `API Error: ${userResponse.status} ${userResponse.statusText}`,
        )
        console.error("API Response Body:", errorBody)
        return null
      }

      const userData = await userResponse.json()
      console.log("User info request successful: ", userData)

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
      console.error("Network or other error during authorization:", error)
      return null
    }
  },
})
