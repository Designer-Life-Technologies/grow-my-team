/**
 * Auth types
 *
 * Note: Next-Auth type augmentation is done in types/next-auth.d.ts
 * This file contains only local type exports used by auth-related code
 */

// Re-export types from next-auth for convenience
export type { Session, User } from "next-auth"
export type { JWT } from "next-auth/jwt"
