import { useSession } from "next-auth/react"
import type { Phone } from "@/lib/types/base"

/**
 * Extended user type with applicant-specific fields
 */
export interface ApplicantUser {
  id: string
  name?: string | null
  email?: string | null
  firstname?: string
  lastname?: string
  image?: string | null
  userType?: "employer" | "applicant"
  mobile?: Phone
  linkedInUrl?: string
}

/**
 * Hook to access applicant session data
 *
 * This hook provides easy access to the applicant session information,
 * including whether the current user is an applicant and their data.
 *
 * @returns Object containing applicant session information
 */
export function useApplicantSession() {
  const { data: session, status } = useSession()

  const user = session?.user as ApplicantUser | undefined
  const isApplicant = user?.userType === "applicant"

  return {
    /** Whether the current user is an applicant */
    isApplicant,
    /** The applicant user data (includes mobile, linkedInUrl) */
    user: isApplicant ? user : null,
    /** The full session object */
    session,
    /** Session loading status */
    status,
    /** Whether the session is loading */
    isLoading: status === "loading",
    /** Whether the user is authenticated (employer or applicant) */
    isAuthenticated: status === "authenticated",
  }
}
