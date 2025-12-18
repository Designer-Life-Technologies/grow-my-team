# Applicant Authentication System

This document describes the applicant authentication system integrated with Next-Auth.

## Overview

The application supports two types of users:

1. **Staff Users** - Employees who manage positions and applicants
2. **Applicant Users** - Applicants who apply for positions

Both user types use the same Next-Auth session system but are distinguished by the `userType` field.

## Architecture

### Type Definitions

The session types are extended in `types/next-auth.d.ts` to support applicant users:

```typescript
interface User {
  // ... standard fields
  userType?: "staff" | "applicant";
  applicant?: Applicant;
}

interface Session {
  user: {
    // ... standard fields
    userType?: "staff" | "applicant";
  };
  applicant?: Applicant;
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

#### For Applicants (Guest Application Flow)

**Note:** Currently, the application process is guest-only. Applicants are NOT logged in during the application process.

1. **Resume Upload**

   - User uploads resume
   - API processes and creates applicant record
   - API returns applicant data via SSE
   - Applicant data is stored in component state (guest user)

2. **Application Form**

   - User reviews and updates their personal information
   - Form is pre-filled with data extracted from resume
   - User can modify any field before proceeding
   - No authentication required

3. **Application Creation**

   - User submits the application form
   - System updates applicant information if needed
   - System creates the application record linking applicant to position
   - No session is created (guest application)

4. **Screening Questions**

   - Applicant completes screening questions
   - All data is submitted without authentication

5. **Application Complete**
   - Application is successfully submitted
   - Applicant receives confirmation
   - No login session is created

**Future Enhancement:** Applicant authentication can be added later to enable features like:

- Viewing application status
- Applying to multiple positions with saved profile
- Tracking interview progress
- Updating profile information

## Usage

### Client-Side

#### Check if User is Applicant

```typescript
import { useApplicantSession } from "@/hooks/use-applicant-session";

function MyComponent() {
  const { isApplicant, user } = useApplicantSession();

  if (isApplicant && user) {
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
        <p>Phone: {user.mobile?.localNumber}</p>
        <p>LinkedIn: {user.linkedInUrl}</p>
      </div>
    );
  }

  return <div>Please apply for a position</div>;
}
```

#### Access Session Data

```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session } = useSession();

  if (session?.user?.userType === "applicant") {
    console.log("Applicant ID:", session.user.id);
    console.log("Applicant Email:", session.user.email);
    console.log("Applicant Mobile:", session.user.mobile);
    console.log("Applicant LinkedIn:", session.user.linkedInUrl);
  }
}
```

### Server-Side

#### Get Applicant Session

```typescript
import { getApplicantSessionServer } from "@/lib/auth/actions";

export async function GET() {
  const { isApplicant, user } = await getApplicantSessionServer();

  if (isApplicant && user) {
    // Handle applicant request
    console.log(
      "Applicant:",
      user.id,
      user.email,
      user.mobile,
      user.linkedInUrl
    );
  }
}
```

#### Check Session in Server Component

```typescript
import { auth } from "@/lib/auth/auth";

export default async function Page() {
  const session = await auth();

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
   await sendVerificationEmail(applicant.email.address);

   // Only create session after email is verified
   ```

2. **Magic Links**

   ```typescript
   // Generate secure token
   const token = generateSecureToken();

   // Send magic link to applicant
   await sendMagicLink(applicant.email.address, token);

   // Verify token before creating session
   ```

3. **OTP (One-Time Password)**

   ```typescript
   // Send OTP to applicant's phone
   await sendOTP(applicant.mobile.localNumber);

   // Verify OTP before creating session
   ```

4. **Token-Based Authentication**

   ```typescript
   // API generates applicant token
   const applicantToken = await api.createApplicantToken(applicant.id);

   // Use token for authentication
   await signIn("applicant", { token: applicantToken });
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

**Important:** The applicant is NOT logged in. All application data is stored in component state as a guest user.

### Application Creation

After the applicant reviews and confirms their information:

```typescript
// Create the application (guest flow - no authentication)
const applicationResult = await createApplication(applicantId, positionId);

if (applicationResult.success) {
  // Application created successfully
  // No session is created - guest application flow
  logger.log("✅ Application created - guest application flow (no login)");
}
```

### Guest Application Flow

The current implementation uses a **guest application flow** with no authentication:

- Applicants can apply without creating an account
- No session or login is required
- Application data is submitted directly to the API
- Simpler user experience with fewer barriers to application

## Middleware Configuration

Update `middleware.ts` to handle applicant routes:

```typescript
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/positions/:path*",
    "/settings/:path*",
    "/applicant/dashboard/:path*", // Applicant dashboard
  ],
};
```

## Route Protection

### Staff-Only Routes

```typescript
// middleware.ts or page.tsx
if (session?.user?.userType !== "staff") {
  redirect("/applicant/dashboard");
}
```

### Applicant-Only Routes

```typescript
// middleware.ts or page.tsx
if (session?.user?.userType !== "applicant") {
  redirect("/login");
}
```

### Public Routes

```typescript
// No authentication required
// e.g., /position/[id]
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
});
```

### Verify Session

```typescript
const session = await getSession();
expect(session?.user?.userType).toBe("applicant");
expect(session?.applicant?.id).toBe("test-id");
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
