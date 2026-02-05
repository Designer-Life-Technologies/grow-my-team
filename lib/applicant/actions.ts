"use server"

import { callGetMeApi, safeCallGetMeApi } from "@/lib/api"
import { logger } from "@/lib/utils/logger"
import {
  ensureValidEmail,
  ensureValidPhone,
  FormValidationError,
  normalizeContactInput,
} from "@/lib/validation/contact"
import type {
  Applicant,
  ApplicantPublic,
  Resume,
  ResumeReference,
  ScreeningAnswer,
} from "./types"

/**
 * Candidate Actions
 *
 * Server actions for candidate-facing features.
 */

/**
 * Get all open positions
 *
 * Returns a list of all currently open job positions from the public API.
 *
 * @returns Promise<ApplicantPublic.Position[]> - Array of open positions
 */
export async function getOpenPositions(): Promise<ApplicantPublic.Position[]> {
  const result = await safeCallGetMeApi<ApplicantPublic.Position[]>(
    "/public/vacancy",
    {
      public: true,
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    },
  )

  if (!result.success) {
    // Errors are already logged by the API client
    return []
  }

  return result.data
}

function buildReferencePayload(reference: ResumeReference): ResumeReference {
  const normalizedName = normalizeContactInput(reference.name) || ""

  if (normalizedName.length < 2) {
    throw new FormValidationError(
      "Reference name must be at least 2 characters long.",
      "name",
    )
  }

  const email = ensureValidEmail(reference.email)
  const phone = ensureValidPhone(reference.phone)

  if (!email && !phone) {
    throw new FormValidationError(
      "Provide at least an email or phone number for the reference.",
      "contact",
    )
  }

  return {
    ...reference,
    name: normalizedName,
    email,
    phone,
    position: normalizeContactInput(reference.position),
    company: normalizeContactInput(reference.company),
    relationship: normalizeContactInput(reference.relationship),
    applicantPosition: normalizeContactInput(
      reference.applicantPosition !== null &&
        reference.applicantPosition !== undefined
        ? reference.applicantPosition.toString()
        : null,
    ),
  }
}

export async function addApplicationResumeReference(
  applicationId: string,
  reference: ResumeReference,
): Promise<ResumeReference> {
  if (!applicationId) {
    throw new Error("Missing application ID for resume reference")
  }

  const payload = buildReferencePayload(reference)

  const response = await callGetMeApi<ResumeReference>(
    `/applicant/application/${applicationId}/resume/reference`,
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  )

  return response.data
}

export async function updateApplicationResumeReference(
  applicationId: string,
  referenceId: string,
  reference: ResumeReference,
): Promise<ResumeReference> {
  if (!applicationId || !referenceId) {
    throw new Error("Missing identifiers for resume reference update")
  }

  const payload = buildReferencePayload(reference)

  const response = await callGetMeApi<ResumeReference>(
    `/applicant/application/${applicationId}/resume/reference/${referenceId}`,
    {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    },
  )

  return response.data
}

/**
 * Retrieve the resume associated with an application
 *
 * @param applicationId - The ID of the application whose resume we need
 * @returns Promise<Resume>
 */
export async function getApplicationResume(
  applicationId: string,
): Promise<Resume> {
  if (!applicationId) {
    throw new Error("Missing application ID for resume request")
  }

  const result = await safeCallGetMeApi<Resume>(
    `/applicant/application/${applicationId}/resume`,
  )

  if (!result.success) {
    const error = new Error(result.error) as Error & { status?: number }
    error.status = result.status
    throw error
  }

  return result.data
}

/**
 * Get position details by ID
 *
 * Returns full details of a specific job position from the public API.
 *
 * @param positionId - The ID of the position to fetch
 * @returns Promise<ApplicantPublic.Position | null> - Position details or null if not found
 */
export async function getPositionById(
  positionId: string,
): Promise<ApplicantPublic.Position | null> {
  const result = await safeCallGetMeApi<ApplicantPublic.Position>(
    `/public/vacancy/${positionId}`,
    {
      public: true,
    },
  )

  if (!result.success) {
    if (result.status === 404) {
      return null
    }
    // For other errors (e.g. 500), throw so the global error boundary catches it
    throw new Error(result.error)
  }

  return result.data
}

/**
 * Update applicant details
 *
 * Updates the applicant's information in the GetMe.video API.
 *
 * @param applicantId - The ID of the applicant to update
 * @param data - Partial applicant data to update
 * @returns Promise<{ success: boolean; applicant?: Applicant; error?: string }>
 */
export async function updateApplicant(
  applicantId: string,
  data: Partial<
    Pick<
      Applicant,
      "id" | "firstname" | "lastname" | "email" | "mobile" | "linkedInUrl"
    >
  >,
): Promise<{ success: boolean; applicant?: Applicant; error?: string }> {
  try {
    if (data.email) {
      const emailValue =
        typeof data.email === "string" ? data.email : data.email.address
      data.email = ensureValidEmail(emailValue, { required: true }) || undefined
    }

    if (data.mobile) {
      const phoneValue =
        typeof data.mobile === "string" ? data.mobile : data.mobile.localNumber
      data.mobile =
        ensureValidPhone(phoneValue, { required: true }) || undefined
    }

    data.id = applicantId
    const response = await callGetMeApi<Applicant>(
      `/applicant/${applicantId}`,
      {
        method: "PUT",
        body: data,
      },
    )

    return {
      success: true,
      applicant: response.data,
    }
  } catch (error) {
    logger.error("Error updating applicant:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update applicant"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Create a new application
 *
 * Creates a new application in GetMe.video by linking an applicant to a position.
 * This should be called after updating applicant details to start the application process.
 * Note: This is currently an unauthenticated endpoint.
 *
 * @param applicantId - The ID of the applicant
 * @param positionId - The ID of the position (vacancyId) being applied to
 * @returns Promise<{ success: boolean; applicationId?: string; error?: string }>
 */
export async function createApplication(
  applicantId: string,
  positionId: string,
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    const response = await callGetMeApi<{ id: string }>(
      `/applicant/${applicantId}/application`,
      {
        method: "POST",
        body: {
          applicant: applicantId,
          vacancy: positionId,
        },
      },
    )

    return {
      success: true,
      applicationId: response.data.id,
    }
  } catch (error) {
    logger.error("Error creating application:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create application",
    }
  }
}

/**
 * Find an existing application
 *
 * Checks if an application already exists for the given applicant and position.
 * This should be called when a logged-in applicant visits the application page
 * to prevent duplicate applications.
 *
 * @param applicantId - The ID of the applicant
 * @param positionId - The ID of the position (vacancyId)
 * @returns Promise<{ success: boolean; applicationId?: string; error?: string }>
 */
export async function findApplication(
  applicantId: string,
  positionId: string,
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    // callGetMeApi throws on non-2xx; treat "not found" as empty result.
    const response = await callGetMeApi<{ id: string }>(
      `/applicant/${applicantId}/application/search?vacancyId=${positionId}`,
      {
        method: "GET",
      },
    ).catch((error: unknown) => {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("404")
      ) {
        return null
      }
      throw error
    })

    if (!response || !response.data) {
      return {
        success: true,
        applicationId: undefined,
      }
    }

    return {
      success: true,
      applicationId: response.data.id,
    }
  } catch (error) {
    logger.error("Error finding application:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to find application",
    }
  }
}

/**
 * Submit screening answers for an application
 *
 * Submits the applicant's screening question responses to the GetMe.video API.
 *
 * @param applicantId - The ID of the applicant
 * @param applicationId - The ID of the application
 * @param answers - Array of screening answers with question/answer pairs
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function submitScreeningAnswers(
  applicantId: string,
  applicationId: string,
  answers: ScreeningAnswer[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await callGetMeApi<unknown>(
      `/applicant/${applicantId}/application/${applicationId}`,
      {
        method: "PUT",
        body: { screeningAnswers: answers },
      },
    )

    return {
      success: true,
    }
  } catch (error) {
    logger.error("Error submitting screening answers:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit screening answers",
    }
  }
}
