import Credentials from "next-auth/providers/credentials"

import { resolveGetMeApiUrlFromHeaders } from "@/lib/api/getme-api-url"
import type { ApplicantApplication } from "@/lib/applicant/types"
import { logger } from "@/lib/utils/logger"
import { maskSecret, type TokenResponse } from "./shared"

const decodeJwtPayload = (token: string) => {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const paddedPayload = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4 || 4)) % 4),
      "=",
    )
    const json = Buffer.from(paddedPayload, "base64").toString("utf8")
    return JSON.parse(json) as Record<string, unknown>
  } catch (error) {
    logger.warn("Failed to decode PIN JWT payload", error)
    return null
  }
}

/**
 * PIN Credentials Provider
 *
 * Handles stateless authentication for PIN users. These users receive a scoped
 * JWT that only grants access to specific application routes.
 */
export const pinProvider = Credentials({
  id: "pin",
  name: "PIN",
  credentials: {
    applicationId: { label: "Application ID", type: "text" },
    pin: { label: "PIN", type: "text" },
    pinAction: { label: "PIN Action", type: "text" },
  },

  async authorize(credentials, request) {
    const applicationId = credentials?.applicationId?.trim()
    const pin = credentials?.pin?.trim()
    const requestedPinAction = credentials?.pinAction?.trim()?.toUpperCase()

    if (!applicationId || !pin) {
      return null
    }

    try {
      const apiBase = await resolveGetMeApiUrlFromHeaders(request?.headers)
      const tokenUrl = new URL("/v1/auth/token", apiBase).toString()
      const applicationUrl = new URL(
        `/v1/applicant/application/${applicationId}`,
        apiBase,
      ).toString()
      const tokenRequestBody = {
        grant_type: "custom:pin",
        applicationId,
        pin,
        ...(requestedPinAction ? { action: requestedPinAction } : {}),
      }

      logger.info("[nextauth][pin] POST /v1/auth/token request", {
        url: tokenUrl,
        body: {
          ...tokenRequestBody,
          pin: maskSecret(pin, 2),
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
        logger.error("PIN token exchange failed", {
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

      logger.info("[nextauth][pin] POST /v1/auth/token response", {
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

      const decodedPayload = decodeJwtPayload(token.access_token)
      const pinAction =
        typeof decodedPayload?.pinAction === "string"
          ? decodedPayload.pinAction
          : undefined

      const applicationRes = await fetch(applicationUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
        },
      })

      if (!applicationRes.ok) {
        const text = await applicationRes.text().catch(() => "")
        logger.error("PIN application fetch failed", {
          status: applicationRes.status,
          body: text || undefined,
        })
        return null
      }

      const applicationData =
        (await applicationRes.json()) as ApplicantApplication

      const applicantData = applicationData.applicant

      const rawEmail =
        typeof applicantData?.email === "string"
          ? applicantData.email
          : applicantData?.email?.address
      const safeEmail =
        rawEmail ??
        `application-${applicationId}@applications.growmyteam.invalid`

      const userPayload = {
        id: applicantData?.id ?? applicationId,
        email: safeEmail,
        firstname: applicantData?.firstname,
        lastname: applicantData?.lastname,
        userType: "application" as const,
        accessToken: token.access_token,
        expiresIn: token.expires_in,
        mobile:
          typeof applicantData?.mobile === "string"
            ? undefined
            : applicantData?.mobile,
        linkedInUrl: applicantData?.linkedInUrl,
        applicationId,
        vacancyId: applicationData.vacancy,
        pinAction,
      }

      logger.info("[nextauth][pin] authorize payload", userPayload)

      return userPayload
    } catch (error) {
      logger.error("Error authenticating PIN user:", error)
      return null
    }
  },
})
