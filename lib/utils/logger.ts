/**
 * Centralized logging utility
 *
 * Controls console output based on environment variables.
 * Set NEXT_PUBLIC_ENABLE_LOGGING=false to disable all logs in production.
 */

const isLoggingEnabled =
  process.env.NEXT_PUBLIC_ENABLE_LOGGING !== "false" &&
  process.env.NODE_ENV !== "production"

/**
 * Logger object with console methods that can be toggled on/off
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (isLoggingEnabled) {
      console.log(...args)
    }
  },

  info: (...args: unknown[]) => {
    if (isLoggingEnabled) {
      console.info(...args)
    }
  },

  warn: (...args: unknown[]) => {
    if (isLoggingEnabled) {
      console.warn(...args)
    }
  },

  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args)
  },

  debug: (...args: unknown[]) => {
    if (isLoggingEnabled && process.env.NODE_ENV === "development") {
      console.debug(...args)
    }
  },

  table: (data: unknown) => {
    if (isLoggingEnabled) {
      console.table(data)
    }
  },
}

/**
 * Check if logging is currently enabled
 */
export const isDebugMode = () => isLoggingEnabled
