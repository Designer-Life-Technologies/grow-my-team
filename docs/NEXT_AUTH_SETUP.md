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
# Optional host overrides (comma-separated host=baseUrl pairs)
GETME_API_URL_MAP=careers.example.com=https://api.acme.getme.video,partners.example.com=https://api.beta.getme.video
```

- `NEXTAUTH_URL`: The base URL of your application
- `NEXTAUTH_SECRET`: A secret key for encrypting JWT tokens (generate a secure random string)
- `GETME_API_URL`: The default base URL for the GetMe.video API
- `GETME_API_URL_MAP`: Optional host-based overrides. Provide one or more `host=baseUrl` entries separated by commas. When the app is served from a host listed here, requests use the mapped API base instead of `GETME_API_URL`.

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
- `/settings/*`

## Server-Side API Integration

The authentication system provides secure server-side access to the GetMe.video API using JWT tokens. Access tokens are never exposed to the client-side for security.

### Server-Side API Utility

A utility function `callGetMeApi` is available at `lib/api/index.ts` for making authenticated requests to the GetMe.video API:

```typescript
import { callGetMeApi } from "@/lib/api";

// Example usage in server actions or API routes
export async function getUserProfile() {
  try {
    const profile = await callGetMeApi<UserProfile>("/users/me");
    return profile;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
}
```

This function automatically:

- Retrieves the JWT token from server-side cookies
- Extracts the access token from the JWT (server-side only)
- Includes the Authorization header with the Bearer token
- Handles errors and authentication failures

### GetMe.video API Integration

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
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
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
  );
}
```

## Using Authentication in Components

To access the authenticated user and perform authentication actions in your components:

```tsx
// Import authentication hooks and functions
import { signIn, signOut } from "@/app/(auth)/auth";
import { useSession } from "next-auth/react";

// In your component
const { data: session } = useSession();

// Access user information (safe data only)
const user = session?.user;
// Note: accessToken is NOT available client-side

// Sign in
await signIn("credentials", {
  username: "username",
  password: "password",
  redirect: true, // Will redirect to the page the user was trying to access
});

// Sign out
await signOut();
```

## Making Authenticated API Requests

### Server-Side (Recommended)

Use the provided `callGetMeApi` utility function for all authenticated API requests:

```tsx
// lib/user/actions.ts
"use server";

import { callGetMeApi } from "@/lib/api";
import type { UserProfile } from "./types";

export async function getCurrentUserProfile(): Promise<UserProfile> {
  return await callGetMeApi<UserProfile>("/users/me");
}

export async function updateUserProfile(
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  return await callGetMeApi<UserProfile>("/users/me", {
    method: "PUT",
    body: data,
  });
}
```

### Implementation Details

The `callGetMeApi` function handles authentication automatically by:

1. **Retrieving JWT Token**: Uses `getToken` from `next-auth/jwt` to access the JWT token from server-side cookies
2. **Extracting Access Token**: Gets the `accessToken` from the JWT token (never exposed to client)
3. **Making Authenticated Requests**: Includes the `Authorization: Bearer <token>` header
4. **Error Handling**: Throws appropriate errors for authentication failures

```typescript
// lib/api/index.ts implementation
"use server";

import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

async function callGetMeApi<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  // Get JWT token directly from cookies (server-side only)
  const cookieStore = await cookies();
  const token = await getToken({
    req: {
      cookies: Object.fromEntries(
        cookieStore.getAll().map((cookie) => [cookie.name, cookie.value]),
      ),
    } as unknown as Request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const accessToken = token?.accessToken;
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  // Make authenticated request...
}
```

### Using Server Actions in Components

Call server actions from client components:

```tsx
// components/auth/ProfileDisplay.tsx
import { getCurrentUserProfile } from "@/lib/user/actions";

export async function ProfileDisplay() {
  const user = await getCurrentUserProfile();

  return (
    <div>
      <h2>Welcome, {user.firstname}!</h2>
      <p>Email: {user.email}</p>
    </div>
  );
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
