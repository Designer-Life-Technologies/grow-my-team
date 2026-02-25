import Credentials from "next-auth/providers/credentials"
import { resolveGetMeApiUrlFromHeaders } from "@/lib/api/getme-api-url"
import type { Applicant } from "@/lib/applicant/types"
import { logger } from "@/lib/utils/logger"
import { maskSecret, type TokenResponse } from "./shared"

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
  async authorize(credentials, request) {
    const applicantId = credentials?.id
    const email = credentials?.email
    const nonce = credentials?.nonce

    if (!nonce) return null
    if (!applicantId && !email) return null

    try {
      const apiBase = await resolveGetMeApiUrlFromHeaders(request?.headers)
      const tokenRequestBody = {
        grant_type: "custom:nonce",
        // Some backends use applicantId, others use id. Send both.
        applicantId,
        id: applicantId,
        email,
        nonce,
      }

      const tokenUrl = new URL("/v1/auth/token", apiBase).toString()
      logger.info("[nextauth][applicant] POST /v1/auth/token request", {
        url: tokenUrl,
        body: {
          ...tokenRequestBody,
          nonce: maskSecret(nonce, 6),
        },
      })

      const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tokenRequestBody),
      })

      if (!tokenRes.ok) {
        const text = await tokenRes.text().catch(() => "")
        logger.error("Applicant token exchange failed", {
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

      logger.info("[nextauth][applicant] POST /v1/auth/token response", {
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

      const applicantUrl = new URL("/v1/applicant", apiBase).toString()
      const applicantRes = await fetch(applicantUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
        },
      })

      if (!applicantRes.ok) {
        const text = await applicantRes.text().catch(() => "")
        logger.error("Applicant profile fetch failed", {
          status: applicantRes.status,
          body: text || undefined,
        })
        return null
      }

      const applicantData = (await applicantRes.json()) as Applicant

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
      logger.error("Error authenticating applicant:", error)
      return null
    }
  },
})
