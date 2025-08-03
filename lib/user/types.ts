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
    roles: [UserOrganisationRoles]
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
