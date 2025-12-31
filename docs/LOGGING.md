# Logging Guide

This guide explains how to control console output throughout the application.

## Overview

The application uses a centralized logging utility (`lib/utils/logger.ts`) that allows you to toggle console output on/off based on environment variables.

## Quick Start

### Enable/Disable Logging

Add to your `.env.local` file:

```bash
# Enable logging (default in development)
NEXT_PUBLIC_ENABLE_LOGGING=true

# Disable logging
NEXT_PUBLIC_ENABLE_LOGGING=false
```

### Default Behavior

- **Development:** Logging is **enabled** by default
- **Production:** Logging is **disabled** by default (except errors)
- **Errors:** Always logged, even in production

## Usage

### Replace console statements

Instead of using `console.log`, `console.error`, etc., import and use the logger:

```typescript
import { logger } from "@/lib/utils/logger";

// Instead of: console.log("User data:", user)
logger.log("User data:", user);

// Instead of: console.error("Failed to fetch:", error)
logger.error("Failed to fetch:", error);

// Instead of: console.info("Process started")
logger.info("Process started");

// Instead of: console.warn("Deprecated API")
logger.warn("Deprecated API");

// Debug logs (only in development)
logger.debug("Debug info:", data);

// Tables
logger.table(arrayOfObjects);
```

## Logger Methods

| Method           | Description            | Enabled In                      |
| ---------------- | ---------------------- | ------------------------------- |
| `logger.log()`   | General logging        | Development (when enabled)      |
| `logger.info()`  | Informational messages | Development (when enabled)      |
| `logger.warn()`  | Warning messages       | Development (when enabled)      |
| `logger.error()` | Error messages         | **Always** (even in production) |
| `logger.debug()` | Debug messages         | Development only                |
| `logger.table()` | Table output           | Development (when enabled)      |

## Environment Variables

### `NEXT_PUBLIC_ENABLE_LOGGING`

Controls whether logging is enabled.

- **Type:** `string` ("true" or "false")
- **Default:**
  - Development: `true`
  - Production: `false`
- **Example:**
  ```bash
  NEXT_PUBLIC_ENABLE_LOGGING=false
  ```

## Examples

### Server Actions

```typescript
"use server";

import { logger } from "@/lib/utils/logger";

export async function fetchData() {
  try {
    logger.log("Fetching data...");
    const response = await fetch(url);
    logger.log("Data fetched successfully");
    return data;
  } catch (error) {
    logger.error("Failed to fetch data:", error);
    throw error;
  }
}
```

### Client Components

```typescript
"use client";

import { logger } from "@/lib/utils/logger";

export function MyComponent() {
  const handleClick = () => {
    logger.log("Button clicked");
    // ... rest of logic
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Checking if Logging is Enabled

```typescript
import { isDebugMode } from "@/lib/utils/logger";

if (isDebugMode()) {
  // Perform expensive debug operations
  performDetailedAnalysis();
}
```

## Migration Guide

To migrate existing code to use the logger:

1. **Find all console statements:**

   ```bash
   grep -r "console\." --include="*.ts" --include="*.tsx"
   ```

2. **Replace with logger:**

   - `console.log` → `logger.log`
   - `console.error` → `logger.error`
   - `console.warn` → `logger.warn`
   - `console.info` → `logger.info`
   - `console.debug` → `logger.debug`

3. **Add import:**
   ```typescript
   import { logger } from "@/lib/utils/logger";
   ```

## Best Practices

1. **Use appropriate log levels:**

   - `logger.error()` for errors that need attention
   - `logger.warn()` for warnings
   - `logger.info()` for important information
   - `logger.log()` for general debugging
   - `logger.debug()` for detailed debugging

2. **Keep errors visible:**

   - Always use `logger.error()` for errors (they're always logged)
   - Don't use `logger.log()` for critical errors

3. **Avoid logging sensitive data:**

   ```typescript
   // ❌ Bad
   logger.log("User password:", password);

   // ✅ Good
   logger.log("User authenticated:", userId);
   ```

4. **Use structured logging:**
   ```typescript
   // ✅ Good - easy to parse
   logger.log("User action:", { userId, action: "login", timestamp });
   ```

## Troubleshooting

### Logs not appearing in development

1. Check your `.env.local` file:

   ```bash
   NEXT_PUBLIC_ENABLE_LOGGING=true
   ```

2. Restart your development server:
   ```bash
   pnpm dev
   ```

### Logs appearing in production

1. Verify `NODE_ENV=production` is set
2. Check `NEXT_PUBLIC_ENABLE_LOGGING` is not set to `"true"` in production
3. Remember: `logger.error()` always logs, even in production

## Related Files

- **Logger utility:** `lib/utils/logger.ts`
- **Example usage:** `lib/applicant/actions.ts`
- **Environment config:** `.env.example`
