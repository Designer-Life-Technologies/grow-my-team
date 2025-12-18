import Credentials from "next-auth/providers/credentials"
import type { Applicant } from "@/lib/applicant/types"

type TokenResponse = {
  access_token: string
  token_type: "Bearer" | string
  expires_in: number
  scope: string
}

function maskSecret(value: string | undefined, visiblePrefix = 4) {
  if (!value) return value
  if (value.length <= visiblePrefix) return "***"
  return `${value.slice(0, visiblePrefix)}***`
}

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
    id: { label: "Applicant ID", type: "text" },
    email: { label: "Applicant Email", type: "text" },
    nonce: { label: "Nonce", type: "text" },
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
    const applicantId = credentials?.id
    const email = credentials?.email
    const nonce = credentials?.nonce

    if (!process.env.GETME_API_URL) {
      console.error("GETME_API_URL is not set")
      return null
    }

    if (!nonce) return null
    if (!applicantId && !email) return null

    try {
      const tokenRequestBody = {
        grant_type: "custom:nonce",
        // Some backends use applicantId, others use id. Send both.
        applicantId,
        id: applicantId,
        email,
        nonce,
      }

      console.log("[nextauth][applicant] POST /applicant/auth/token request", {
        url: `${process.env.GETME_API_URL}/applicant/auth/token`,
        body: {
          ...tokenRequestBody,
          nonce: maskSecret(nonce, 6),
        },
      })

      const tokenRes = await fetch(
        `${process.env.GETME_API_URL}/applicant/auth/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tokenRequestBody),
        },
      )

      if (!tokenRes.ok) {
        const text = await tokenRes.text().catch(() => "")
        console.error("Applicant token exchange failed", {
          status: tokenRes.status,
          body: text || undefined,
        })
        return null
      }

      const tokenText = await tokenRes.text().catch(() => "")
      const parsed = (() => {
        try {
          return tokenText
            ? (JSON.parse(tokenText) as Record<string, unknown>)
            : null
        } catch {
          return null
        }
      })()

      console.log("[nextauth][applicant] POST /applicant/auth/token response", {
        status: tokenRes.status,
        ok: tokenRes.ok,
        body:
          parsed && typeof parsed === "object"
            ? {
                ...parsed,
                access_token:
                  typeof parsed.access_token === "string"
                    ? maskSecret(parsed.access_token, 10)
                    : parsed.access_token,
              }
            : tokenText
              ? tokenText.slice(0, 2000)
              : undefined,
      })

      const token =
        parsed as TokenResponse | null satisfies TokenResponse | null

      if (!token?.access_token) {
        return null
      }

      const applicantRes = await fetch(
        `${process.env.GETME_API_URL}/applicant`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.access_token}`,
          },
        },
      )

      if (!applicantRes.ok) {
        const text = await applicantRes.text().catch(() => "")
        console.error("Applicant profile fetch failed", {
          status: applicantRes.status,
          body: text || undefined,
        })
        return null
      }

      const applicantData = (await applicantRes.json()) as Applicant

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
        accessToken: token.access_token,
        expiresIn: token.expires_in,
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
