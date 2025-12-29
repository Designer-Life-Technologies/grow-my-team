# Custom React Hooks

This directory contains custom React hooks that encapsulate reusable logic and state management for the Grow My Team application.

## What are React Hooks?

React hooks are functions that let you "hook into" React state and lifecycle features from function components. Custom hooks allow you to extract component logic into reusable functions, following the DRY (Don't Repeat Yourself) principle.

### Benefits of Custom Hooks

- **Reusability**: Share logic across multiple components
- **Separation of Concerns**: Keep components focused on UI while hooks handle business logic
- **Testability**: Easier to test logic in isolation
- **Maintainability**: Centralize common patterns in one place

## Hooks in this Directory

### `useApplicantSession`

**File**: `use-applicant-session.ts`

**Purpose**: Provides easy access to applicant-specific session data and authentication state.

**What it does**:

- Wraps Next-Auth's `useSession` hook with applicant-specific logic
- Determines if the current user is an applicant (vs. employer user)
- Provides type-safe access to applicant-specific fields (mobile, linkedInUrl)
- Exposes authentication status and loading states

**Returns**:

```typescript
{
  isApplicant: boolean; // True if user type is "applicant"
  user: ApplicantUser | null; // Applicant user data (null if not applicant)
  session: Session | null; // Full Next-Auth session object
  status: string; // Session status: "loading" | "authenticated" | "unauthenticated"
  isLoading: boolean; // True while session is loading
  isAuthenticated: boolean; // True if any user is authenticated
}
```

**Usage Example**:

```typescript
import { useApplicantSession } from "@/hooks/use-applicant-session";

function MyComponent() {
  const { isApplicant, user, isLoading } = useApplicantSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isApplicant) return <div>Access denied</div>;

  return <div>Welcome, {user?.firstname}!</div>;
}
```

**When to use**:

- In applicant-facing components that need to check authentication
- When you need access to applicant-specific data (mobile, linkedInUrl)
- To conditionally render UI based on user type

---

### `useCreateApplicant`

**File**: `use-create-applicant.ts`

**Purpose**: Manages the applicant creation process with real-time streaming updates during job application submission.

**What it does**:

- Handles form submission to the `/api/applicant/create` endpoint
- Creates a new applicant record in GetMe.video
- Processes Server-Sent Events (SSE) for real-time progress updates
- Manages streaming state and event collection
- Extracts applicant data from successful responses
- Provides error handling and recovery

**Returns**:

```typescript
{
  createApplicant: (formData: FormData, onEvent?: (event: StreamingEvent) => void) => Promise<{
    success: boolean
    events: StreamingEvent[]
    applicant?: Applicant
  }>
  isStreaming: boolean          // True while processing the stream
  events: StreamingEvent[]      // Array of all received events
}
```

**Usage Example**:

```typescript
import { useCreateApplicant } from "@/hooks/use-create-applicant";

function ApplicationForm() {
  const { createApplicant, isStreaming } = useCreateApplicant();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("vacancyId", positionId);

    const result = await createApplicant(formData, (event) => {
      console.log("Progress:", event.message);
    });

    if (result.success) {
      console.log("Applicant created:", result.applicant);
    }
  };

  return <button disabled={isStreaming}>Submit</button>;
}
```

**When to use**:

- When submitting job applications with resume uploads
- When you need real-time feedback during long-running operations
- To display progress updates to users during AI processing

**Event Types**:

- `info`: Informational messages about progress
- `success`: Operation completed successfully
- `error`: An error occurred
- `complete`: Stream has finished

---

### `useIsMobile`

**File**: `use-mobile.ts`

**Purpose**: Detects whether the current viewport is mobile-sized and responds to window resize events.

**What it does**:

- Monitors window width using the `matchMedia` API
- Updates state when viewport crosses the mobile breakpoint (768px)
- Handles cleanup to prevent memory leaks
- Returns `undefined` during SSR, then updates on client

**Returns**:

```typescript
boolean; // True if viewport width < 768px
```

**Usage Example**:

```typescript
import { useIsMobile } from "@/hooks/use-mobile";

function ResponsiveComponent() {
  const isMobile = useIsMobile();

  return <div>{isMobile ? <MobileMenu /> : <DesktopMenu />}</div>;
}
```

**When to use**:

- To conditionally render mobile vs. desktop UI
- When you need to adjust behavior based on screen size
- For responsive navigation, sidebars, or modals

**Note**: The breakpoint is set to 768px, which aligns with Tailwind's `md:` breakpoint.

---

## Best Practices

1. **Naming Convention**: All custom hooks should start with `use` (e.g., `useApplicantSession`)
2. **Single Responsibility**: Each hook should have one clear purpose
3. **Type Safety**: Always provide TypeScript types for hook parameters and return values
4. **Error Handling**: Handle errors gracefully and provide meaningful error states
5. **Cleanup**: Always clean up side effects (event listeners, subscriptions) in `useEffect`
6. **Documentation**: Include JSDoc comments explaining what the hook does and how to use it

## Creating New Hooks

When creating a new custom hook:

1. Create a new file in this directory following the naming pattern: `use-[name].ts`
2. Export the hook as a named export
3. Add TypeScript types for all parameters and return values
4. Include JSDoc comments with description and usage examples
5. Update this README with documentation for the new hook
6. Write tests if the hook contains complex logic

## Related Documentation

- [React Hooks Documentation](https://react.dev/reference/react)
- [Next-Auth Session Management](../docs/NEXT_AUTH_SETUP.md)
- [Streaming Modal System](../docs/STREAMING_MODAL.md)
