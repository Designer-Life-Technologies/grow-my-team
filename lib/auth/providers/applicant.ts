import Credentials from "next-auth/providers/credentials"
import type { Applicant } from "@/lib/candidate/types"

/**
 * Applicant Credentials Provider
 *
 * This provider handles authentication for applicant users.
 * It accepts an applicant ID and creates a session for that applicant.
 *
 * This is used when:
 * 1. An applicant completes their application (auto-login)
 * 2. An applicant returns to check their application status (future feature)
 *
 * Security Note: In production, you should implement proper authentication
 * such as email verification, magic links, or OTP for applicants.
 */
export const applicantProvider = Credentials({
  id: "applicant",
  name: "Applicant",
  credentials: {
    applicantId: { label: "Applicant ID", type: "text" },
    applicantData: { label: "Applicant Data", type: "text" },
  },

  /**
   * Authenticates an applicant user
   *
   * This is a simplified authentication flow for applicants.
   * In production, you should verify the applicant's identity properly.
   *
   * @param credentials The applicant ID and data
   * @returns User object with applicant data or null
   */
  async authorize(credentials) {
    if (!credentials?.applicantId || !credentials?.applicantData) {
      return null
    }

    try {
      // Parse the applicant data
      const applicantData: Applicant = JSON.parse(credentials.applicantData)

      // Verify the applicant ID matches
      if (applicantData.id !== credentials.applicantId) {
        console.error("Applicant ID mismatch")
        return null
      }

      // Return user object with applicant type
      // Flatten applicant data into user object to avoid duplication
      return {
        id: applicantData.id,
        email:
          typeof applicantData.email === "string"
            ? applicantData.email
            : applicantData.email.address,
        firstname: applicantData.firstname,
        lastname: applicantData.lastname,
        userType: "applicant" as const,
        mobile:
          typeof applicantData.mobile === "string"
            ? undefined
            : applicantData.mobile,
        linkedInUrl: applicantData.linkedInUrl,
      }
    } catch (error) {
      console.error("Error authenticating applicant:", error)
      return null
    }
  },
})
