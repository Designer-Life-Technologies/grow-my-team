import type { Applicant } from "@/lib/applicant/types"

/**
 * Creates an applicant session after successful application submission
 *
 * This function signs in the applicant user by creating a NextAuth session
 * with the applicant data. The session will be marked as userType: "applicant"
 * to distinguish it from staff users.
 *
 * @param applicant - The applicant data received from the API
 * @returns Promise that resolves when sign-in is complete
 */
export async function signInApplicant(applicant: Applicant) {
  // Create a custom session for the applicant
  // This uses NextAuth's signIn but with a custom provider approach
  // Note: This requires a custom provider or direct session manipulation

  // For now, we'll store the applicant data in localStorage as a fallback
  // and create a proper session in the next step
  if (typeof window !== "undefined") {
    localStorage.setItem("applicant_session", JSON.stringify(applicant))
  }

  // TODO: Implement proper NextAuth session creation for applicants
  // This might require a custom provider or server-side session manipulation
  console.log("Applicant session created:", applicant)
}

/**
 * Gets the current applicant session from localStorage
 * This is a temporary solution until proper NextAuth integration is complete
 *
 * @returns The applicant data if available, null otherwise
 */
export function getApplicantSession(): Applicant | null {
  if (typeof window === "undefined") {
    return null
  }

  const sessionData = localStorage.getItem("applicant_session")
  if (!sessionData) {
    return null
  }

  try {
    return JSON.parse(sessionData) as Applicant
  } catch {
    return null
  }
}

/**
 * Clears the applicant session
 */
export function clearApplicantSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("applicant_session")
  }
}
