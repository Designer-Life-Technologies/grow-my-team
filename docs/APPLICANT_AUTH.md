# Applicant Authentication System

This document describes the applicant authentication system integrated with Next-Auth.

## Overview

The application supports two types of users:
1. **Staff Users** - Employees who manage positions and candidates
2. **Applicant Users** - Candidates who apply for positions

Both user types use the same Next-Auth session system but are distinguished by the `userType` field.

## Architecture

### Type Definitions

The session types are extended in `types/next-auth.d.ts` to support applicant users:

```typescript
interface User {
  // ... standard fields
  userType?: "staff" | "applicant"
  applicant?: Applicant
}

interface Session {
  user: {
    // ... standard fields
    userType?: "staff" | "applicant"
  }
  applicant?: Applicant
}
```

### Authentication Providers

Two Next-Auth providers are configured:

1. **Credentials Provider** (`lib/auth/providers/credentials.ts`)
   - For staff users
   - Authenticates against GetMe.video API
   - Returns `userType: "staff"`

2. **Applicant Provider** (`lib/auth/providers/applicant.ts`)
   - For applicant users
   - Accepts applicant ID and data
   - Returns `userType: "applicant"`

### Session Flow

#### For Applicants

1. **Application Submission**
   - User uploads resume
   - API processes and creates applicant record
   - API returns applicant data via SSE

2. **Auto-Login**
   - `PositionApply` component receives applicant data
   - Calls `signIn("applicant", { applicantId, applicantData })`
   - NextAuth creates session with `userType: "applicant"`

3. **Session Storage**
   - JWT token stores applicant data (flattened into user object)
   - Session callback adds applicant fields to session.user
   - Client can access via `useSession()` or `useApplicantSession()`

4. **Returning Applicant**
   - When applicant returns to apply for another position
   - `PositionApply` checks for existing session
   - If found, skips resume upload and pre-fills application form
   - Shows welcome message: "Welcome back! Your information has been pre-filled"

## Usage

### Client-Side

#### Check if User is Applicant

```typescript
import { useApplicantSession } from "@/hooks/use-applicant-session"

function MyComponent() {
  const { isApplicant, user } = useApplicantSession()

  if (isApplicant && user) {
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
        <p>Phone: {user.mobile?.localNumber}</p>
        <p>LinkedIn: {user.linkedInUrl}</p>
      </div>
    )
  }

  return <div>Please apply for a position</div>
}
```

#### Access Session Data

```typescript
import { useSession } from "next-auth/react"

function MyComponent() {
  const { data: session } = useSession()

  if (session?.user?.userType === "applicant") {
    console.log("Applicant ID:", session.user.id)
    console.log("Applicant Email:", session.user.email)
    console.log("Applicant Mobile:", session.user.mobile)
    console.log("Applicant LinkedIn:", session.user.linkedInUrl)
  }
}
```

### Server-Side

#### Get Applicant Session

```typescript
import { getApplicantSessionServer } from "@/lib/auth/actions"

export async function GET() {
  const { isApplicant, user } = await getApplicantSessionServer()

  if (isApplicant && user) {
    // Handle applicant request
    console.log("Applicant:", user.id, user.email, user.mobile, user.linkedInUrl)
  }
}
```

#### Check Session in Server Component

```typescript
import { auth } from "@/lib/auth/auth"

export default async function Page() {
  const session = await auth()

  if (session?.user?.userType === "applicant") {
    // Render applicant view
  }
}
```

## Security Considerations

### Current Implementation

The current implementation is simplified for development:
- Applicant data is passed directly to the provider
- No additional verification is performed
- Session is created immediately after application

### Production Recommendations

For production, implement proper applicant authentication:

1. **Email Verification**
   ```typescript
   // Send verification email after application
   await sendVerificationEmail(applicant.email.address)
   
   // Only create session after email is verified
   ```

2. **Magic Links**
   ```typescript
   // Generate secure token
   const token = generateSecureToken()
   
   // Send magic link to applicant
   await sendMagicLink(applicant.email.address, token)
   
   // Verify token before creating session
   ```

3. **OTP (One-Time Password)**
   ```typescript
   // Send OTP to applicant's phone
   await sendOTP(applicant.mobile.localNumber)
   
   // Verify OTP before creating session
   ```

4. **Token-Based Authentication**
   ```typescript
   // API generates applicant token
   const applicantToken = await api.createApplicantToken(applicant.id)
   
   // Use token for authentication
   await signIn("applicant", { token: applicantToken })
   ```

## API Integration

### Applicant Creation

When an applicant is created via the API:

```typescript
// API Response (SSE)
{
  message: "Applicant created",
  applicant: {
    id: "68e31a628a646923617c1ddd",
    firstname: "John",
    lastname: "Doe",
    email: { address: "john@example.com", ... },
    mobile: { localNumber: "+1234567890", ... },
    linkedInUrl: "https://linkedin.com/in/johndoe"
  }
}
```

### Session Creation

The applicant data is used to create a session:

```typescript
await signIn("applicant", {
  redirect: false,
  applicantId: applicant.id,
  applicantData: JSON.stringify(applicant),
})
```

## Middleware Configuration

Update `middleware.ts` to handle applicant routes:

```typescript
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/positions/:path*",
    "/candidates/:path*",
    "/settings/:path*",
    "/candidate/dashboard/:path*", // Applicant dashboard
  ],
}
```

## Route Protection

### Staff-Only Routes

```typescript
// middleware.ts or page.tsx
if (session?.user?.userType !== "staff") {
  redirect("/candidate/dashboard")
}
```

### Applicant-Only Routes

```typescript
// middleware.ts or page.tsx
if (session?.user?.userType !== "applicant") {
  redirect("/login")
}
```

### Public Routes

```typescript
// No authentication required
// e.g., /candidate/position/[id]
```

## Testing

### Test Applicant Login

```typescript
// In your test file
await signIn("applicant", {
  applicantId: "test-id",
  applicantData: JSON.stringify({
    id: "test-id",
    firstname: "Test",
    lastname: "User",
    email: { address: "test@example.com" },
    mobile: { localNumber: "+1234567890" },
  }),
})
```

### Verify Session

```typescript
const session = await getSession()
expect(session?.user?.userType).toBe("applicant")
expect(session?.applicant?.id).toBe("test-id")
```

## Troubleshooting

### Session Not Created

- Check that applicant provider is included in `authConfig.providers`
- Verify applicant data is valid JSON
- Check browser console for errors

### Type Errors

- Ensure `types/next-auth.d.ts` is in your TypeScript config
- Restart TypeScript server
- Check that types are properly exported

### Session Not Persisting

- Verify `NEXTAUTH_SECRET` is set
- Check that cookies are enabled
- Ensure session callback is properly configured

## Future Enhancements

1. **Applicant Dashboard**
   - View application status
   - Update profile information
   - Track interview progress

2. **Applicant Login Page**
   - Magic link authentication
   - Email verification
   - Password reset

3. **Multi-Application Support**
   - Track multiple applications
   - Application history
   - Saved positions

4. **Notifications**
   - Email notifications for application updates
   - SMS notifications for interviews
   - In-app notifications
