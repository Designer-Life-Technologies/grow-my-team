import Credentials from "next-auth/providers/credentials"

export const credentialsProvider = Credentials({
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
        id: data.id,
        email: credentials.username,
        name: userData.firstname,
        accessToken: data.access_token,
      }
    } catch (error) {
      console.error("Network or other error during authorization:", error)
      return null
    }
  },
})
