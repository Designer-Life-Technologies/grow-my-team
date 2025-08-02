# Next-Auth Authentication Setup Guide

This guide explains how to set up and use Next-Auth for username/password authentication with the GetMe.video API in the Grow My Team application.

## Overview

The authentication system uses Next-Auth with a custom credentials provider to authenticate users against the GetMe.video API token endpoint. All authentication-related files are placed in the `app/(auth)` directory, and protected routes are managed by middleware.

The system implements a secure session pattern where access tokens are only available server-side, while client-side sessions contain only safe user information.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Next Auth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# GetMe.video API
GETME_API_URL=https://api.getme.video
```

- `NEXTAUTH_URL`: The base URL of your application
- `NEXTAUTH_SECRET`: A secret key for encrypting JWT tokens (generate a secure random string)
- `GETME_API_URL`: The base URL for the GetMe.video API

## Authentication Flow

1. User enters username and password on the login page
2. Credentials are sent to the GetMe.video API token endpoint
3. If authentication is successful, the API returns an access token
4. Next-Auth creates a JWT with the user information and access token (server-side only)
5. Next-Auth creates a session with limited user information (no access token) for client-side use
6. The user is redirected to the protected page they were trying to access
7. Protected routes check for a valid session via middleware

## Protected Routes

The following routes are protected and require authentication:

- `/` (Home page)
- `/dashboard/*`
- `/positions/*`
- `/candidates/*`
- `/settings/*`

## API Integration

The authentication system connects to the GetMe.video API token endpoint to validate credentials. The endpoint is expected to return a JSON response with at least:

- `access_token`: The token to use for authenticated API requests
- `user_id` or `id`: The user's unique identifier
- Optional: `name` and `email` for user profile information

## Secure Session Pattern

The application implements a secure session pattern with the following characteristics:

1. **JWT Storage (Server-side only)**:
   - Access tokens are stored only in the JWT, which is encrypted and stored as an HTTP-only cookie
   - The JWT is only accessible on the server side
   - The JWT contains sensitive information like access tokens needed for API calls

2. **Client Session (Browser-side)**:
   - The client session object only contains safe user information (id, name, email)
   - Access tokens are explicitly excluded from the client session
   - This prevents accidental exposure of tokens in client-side code

3. **Server Actions**:
   - Server actions are used for operations that require the access token
   - These actions run on the server and can safely access the JWT and its tokens
   - Client components call these server actions instead of making authenticated API calls directly

## Session Provider Setup

To enable the `useSession` hook throughout the application, the `SessionProvider` is set up in the root layout:

```tsx
// components/auth/AuthProvider.tsx
"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {/* Application content */}
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Using Authentication in Components

To access the authenticated user and perform authentication actions in your components:

```tsx
// Import authentication hooks and functions
import { signIn, signOut } from "@/app/(auth)/auth"
import { useSession } from "next-auth/react"

// In your component
const { data: session } = useSession()

// Access user information (safe data only)
const user = session?.user
// Note: accessToken is NOT available client-side

// Sign in
await signIn("credentials", {
  username: "username",
  password: "password",
  redirect: true, // Will redirect to the page the user was trying to access
})

// Sign out
await signOut()
```

## Making Authenticated API Requests

### Server-Side (Recommended)

Create server actions to make authenticated API requests:

```tsx
// app/actions/api.ts
"use server"

import { auth } from "@/app/(auth)/auth"

export async function fetchUserData() {
  const session = await auth()
  
  if (!session?.token?.accessToken) {
    throw new Error("Not authenticated")
  }
  
  const response = await fetch(`${process.env.GETME_API_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${session.token.accessToken}`,
    },
  })
  
  if (!response.ok) {
    throw new Error("Failed to fetch user data")
  }
  
  return response.json()
}
```

Then call these server actions from client components:

```tsx
// components/UserProfile.tsx
"use client"

import { useSession } from "next-auth/react"
import { fetchUserData } from "@/app/actions/api"

export function UserProfile() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState(null)
  
  async function loadUserData() {
    try {
      const data = await fetchUserData()
      setUserData(data)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }
  
  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {session?.user?.name}</p>
      <button onClick={loadUserData}>Load User Data</button>
      {userData && <pre>{JSON.stringify(userData, null, 2)}</pre>}
    </div>
  )
}
```

## Troubleshooting

If you encounter authentication issues:

1. Verify that your environment variables are correctly set
2. Check that the GetMe.video API is accessible and returning the expected response format
3. Examine browser console for any errors during the authentication flow
4. Verify that the middleware is correctly protecting routes
5. Ensure that `AuthProvider` is properly wrapping your application in the root layout
6. Check that server actions are correctly accessing the token from the JWT, not the session
