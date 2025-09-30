import type { Email, Phone } from "@/lib/types/base"

export type UserOrganisationRoles = "ADMIN" | "MEMBER" | "GUEST"

export type UserOnboardingStatus =
  | "REGISTERED"
  | "ACCOUNT_CREATED"
  | "LOGGED_IN"
  | "QUESTIONSET_CREATED"
  | "ONBOARDED"

export interface UserProfile {
  id?: string
  email: Email | string
  mobile?: Phone
  firstname: string
  lastname?: string
  organisations?: {
    organisation: Organisation
    roles?: UserOrganisationRoles[]
  }[]
  onboardingStatus?: UserOnboardingStatus
  updated?: string
  created?: string
}

export interface Organisation {
  id?: string
  name: string
  updated?: string
  created?: string
}

// Registration types for unauthenticated user creation
// These types are intentionally minimal and use camelCase to match our codebase conventions.
export interface RegisterUserInput {
  firstname: string
  lastname?: string
  email: Email | string
  mobile?: Phone
  organisationName?: string
  // Include password if the API requires it; optional to avoid hard coupling.
  password?: string
}

export type RegisterUserResult =
  | { success: true }
  | { success: false; error: string; errorMessage?: string }
