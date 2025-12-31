# Applicant Authentication System

This document describes the applicant authentication system integrated with Next-Auth.

## Overview

The application supports three types of users:

1. **Employer Users** - Employees who manage positions and applicants
2. **Applicant Users** - Fully authenticated applicants who completed the applicant provider flow
3. **Application Users** - Applicants authenticated through the PIN flow. These sessions are scoped to a single application and expose a limited portion of the API

All user types share the same Next-Auth session system and are distinguished by the `userType` field.

## Architecture

### Type Definitions

The session types are extended in `types/next-auth.d.ts` to support applicant users:

```typescript
interface User {
  // ... standard fields
  userType?: "employer" | "applicant" | "application";
  mobile?: Phone;
  linkedInUrl?: string;
}

interface Session {
  user: {
    // ... standard fields
    userType?: "employer" | "applicant" | "application";
    mobile?: Phone;
    linkedInUrl?: string;
  } & DefaultSession["user"];
}
```

### Authentication Providers

Three Next-Auth providers are configured:

1. **Credentials Provider** (`lib/auth/providers/credentials.ts`)

   - For employer users
   - Authenticates against GetMe.video API
   - Returns `userType: "employer"`

2. **Applicant Provider** (`lib/auth/providers/applicant.ts`)

   - Exchanges a nonce (or PIN-less callback) for an applicant token
   - Fetches the applicant profile via `/applicant`
   - Returns `userType: "applicant"`

3. **Application (PIN) Provider** (`lib/auth/providers/pin.ts`)
   - Accepts `applicationId` + 6 digit PIN
   - Calls `POST /v1/auth/token` with the `custom:pin` grant
   - Uses the returned application access token to fetch `/v1/applicant`
   - Returns `userType: "application"` (scoped to a single application)

### Session Flow

#### For Applicants (Guest Application Flow)

The initial resume + screening workflow still operates as a guest flow. No session exists during the resume upload or screening steps.

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

#### Application PIN Flow

Applicants can now authenticate with a PIN to access application-scoped routes (e.g., `/application/[id]/profiletest`).

1. Applicant receives a PIN email/text containing a link to `/application/[applicationId]/pin`.
2. The page renders a six-digit PIN input that calls `signIn("pin", { applicationId, pin })`.
3. Next-Auth exchanges the PIN for an application access token (`custom:pin` grant).
4. Using that token, the PIN provider fetches `/v1/applicant` to load the applicant profile.
5. The resulting session has `userType: "application"` and contains the same applicant metadata (email, mobile, LinkedIn, etc.).
6. Middleware limits application users to `/application/[id]/*` routes and redirects them elsewhere if needed.

Application users cannot access employer dashboards or other applicant-only dashboards; their scope is intentionally narrow.

## Usage

### Client-Side

#### Check Session Type

```typescript
import { useApplicantSession } from "@/hooks/use-applicant-session";

function MyComponent() {
  const { isApplicant, isApplicationUser, user } = useApplicantSession();

  if ((isApplicant || isApplicationUser) && user) {
    return (
      <div>
        <p>Welcome, {user.firstname ?? user.name}!</p>
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
  }

  if (session?.user?.userType === "application") {
    console.log("Application-scoped applicant:", {
      id: session.user.id,
      email: session.user.email,
      mobile: session.user.mobile,
    });
  }
}
```

### Server-Side

#### Get Applicant/Application Session

```typescript
import { getApplicantSessionServer } from "@/lib/auth/actions";

export async function GET() {
  const { isApplicant, isApplicationUser, user } =
    await getApplicantSessionServer();

  if ((isApplicant || isApplicationUser) && user) {
    console.log("Applicant:", {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      linkedInUrl: user.linkedInUrl,
    });
  }
}
```

#### Check Session in Server Component

```typescript
import { auth } from "@/lib/auth/auth";

export default async function Page() {
  const session = await auth();

  if (
    session?.user?.userType === "applicant" ||
    session?.user?.userType === "application"
  ) {
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

**Important:** The applicant is NOT logged in during this step. All application data is stored in component state as a guest user until the PIN flow creates a scoped session.

### Application Creation & PIN Distribution

After the applicant reviews and confirms their information:

```typescript
const applicationResult = await createApplication(applicantId, positionId);

if (applicationResult.success) {
  await sendPinEmailOrSms({
    applicationId: applicationResult.applicationId!,
    pin,
    next: `/application/${applicationResult.applicationId}/profiletest`,
  });
}
```

Applicants remain unauthenticated until they redeem their PIN.

## Middleware Configuration

`proxy.ts` (Next middleware) handles applicant routes with the following rules:

- Application users (`userType === "application"`) can only access `/application/[id]/*`.
- Unauthenticated users attempting `/application/[id]/...` are redirected to `/application/[id]/pin`.
- Applicant sessions hitting `/application/[id]/...` are also redirected to the PIN screen for clarity.
- The `/application/[id]/pin` path is always allowed through so the PIN form can render.

**NOTE:** Keep the middleware list in sync with these rules whenever new application routes are introduced.

## Route Protection

### Employer-Only Routes

```typescript
if (session?.user?.userType !== "employer") {
  redirect("/login");
}
```

### Applicant / Application Routes

```typescript
const userType = session?.user?.userType;
if (userType !== "applicant" && userType !== "application") {
  redirect("/applicant/login");
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
await signIn("applicant", { id: applicantId, nonce });
```

### Test Application (PIN) Login

```typescript
await signIn("pin", {
  applicationId,
  pin: "123456",
  redirect: false,
});
```

### Verify Session

```typescript
const session = await getSession();
expect(["applicant", "application"]).toContain(session?.user?.userType);
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
