"use server"

import type { Applicant, Candidate, ScreeningQuestionsData } from "./types"

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
 * @returns Promise<Candidate.Position[]> - Array of open positions
 */
export async function getOpenPositions(): Promise<Candidate.Position[]> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy`,
      {
        // Add cache revalidation to ensure fresh data
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      },
    )

    if (!response.ok) {
      console.error(`Failed to fetch positions: ${response.status}`)
      return []
    }

    const positions = (await response.json()) as Candidate.Position[]
    return positions
  } catch (error) {
    console.error("Error fetching open positions:", error)
    return []
  }
}

/**
 * Get position details by ID
 *
 * Returns full details of a specific job position from the public API.
 *
 * @param positionId - The ID of the position to fetch
 * @returns Promise<Candidate.Position | null> - Position details or null if not found
 */
export async function getPositionById(
  positionId: string,
): Promise<Candidate.Position | null> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy/${positionId}`,
    )
    const position = (await response.json()) as Candidate.Position

    return position
  } catch (error) {
    console.error("Error fetching position details:", error)
    return null
  }
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
      "firstname" | "lastname" | "email" | "mobile" | "linkedInUrl"
    >
  >,
): Promise<{ success: boolean; applicant?: Applicant; error?: string }> {
  try {
    // TODO: Implement actual API call once applicant authentication is available
    // The GetMe.video API endpoint requires an access_token for applicants
    // Current endpoint would be: PATCH /applicant/{applicantId}
    // Headers: Authorization: Bearer {access_token}
    // Body: { firstname?, lastname?, email?, mobile?, linkedInUrl? }

    console.log("🔄 Dummy updateApplicant called:", { applicantId, data })

    // Dummy response for now - simulating successful update
    const updatedApplicant: Applicant = {
      id: applicantId,
      firstname: data.firstname || "John",
      lastname: data.lastname || "Doe",
      email: data.email || {
        address: "john.doe@example.com",
        tag: "APPLICANT",
        permissionToEmail: null,
        verified: null,
        description: null,
      },
      mobile: data.mobile || {
        localNumber: "5551234567",
        isoCountryCode: "US",
        isoNumber: "+15551234567",
        tag: "MOBILE",
        permissionToSMS: null,
        verified: null,
        description: null,
      },
      linkedInUrl: data.linkedInUrl,
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      applicant: updatedApplicant,
    }

    // TODO: Replace with actual implementation:
    // const response = await fetch(
    //   `${process.env.GETME_API_URL}/applicant/${applicantId}`,
    //   {
    //     method: "PATCH",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${accessToken}`, // Need applicant access token
    //     },
    //     body: JSON.stringify(data),
    //   }
    // )
    //
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}))
    //   return {
    //     success: false,
    //     error: errorData.detail || `Failed to update applicant: ${response.status}`,
    //   }
    // }
    //
    // const applicant = await response.json() as Applicant
    // return { success: true, applicant }
  } catch (error) {
    console.error("Error updating applicant:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update applicant",
    }
  }
}

/**
 * Create a new application
 *
 * Creates a new application in GetMe.video by linking an applicant to a position.
 * This should be called after updating applicant details to start the application process.
 *
 * @param applicantId - The ID of the applicant
 * @param positionId - The ID of the position being applied to
 * @returns Promise<{ success: boolean; applicationId?: string; error?: string }>
 */
export async function createApplication(
  applicantId: string,
  positionId: string,
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    // TODO: Implement actual API call to GetMe.video
    // Expected endpoint: POST /application or POST /vacancy/{positionId}/application
    // Headers: Authorization: Bearer {access_token} (if required)
    // Body: {
    //   applicant: applicantId,
    //   vacancy: positionId
    // }

    console.log("🔄 Dummy createApplication called:", {
      applicantId,
      positionId,
    })

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Dummy response - simulating successful application creation
    const applicationId = `app_${Date.now()}`

    return {
      success: true,
      applicationId,
    }

    // TODO: Replace with actual implementation:
    // const response = await fetch(
    //   `${process.env.GETME_API_URL}/application`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       // Authorization may or may not be required depending on API design
    //     },
    //     body: JSON.stringify({
    //       applicant: applicantId,
    //       vacancy: positionId,
    //     }),
    //   }
    // )
    //
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}))
    //   return {
    //     success: false,
    //     error: errorData.detail || `Failed to create application: ${response.status}`,
    //   }
    // }
    //
    // const data = await response.json()
    // return { success: true, applicationId: data.id }
  } catch (error) {
    console.error("Error creating application:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create application",
    }
  }
}

/**
 * Submit screening questions for an application
 *
 * Submits the applicant's screening question responses to the GetMe.video API.
 *
 * @param vacancyId - The ID of the vacancy being applied to
 * @param applicantId - The ID of the applicant
 * @param screeningQuestions - The screening question responses
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function submitScreeningQuestions(
  vacancyId: string,
  applicantId: string,
  screeningQuestions: ScreeningQuestionsData,
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement actual API call once the endpoint is available
    // The GetMe.video API endpoint would be something like:
    // POST /application or POST /vacancy/{vacancyId}/application
    // Headers: Authorization: Bearer {access_token} (if required)
    // Body: {
    //   applicantId: string,
    //   vacancyId: string,
    //   screeningQuestions: {
    //     q1: string,
    //     q2: string,
    //     q3: string,
    //     q4: string,
    //     q5: string
    //   }
    // }

    console.log("🔄 Dummy submitScreeningQuestions called:", {
      vacancyId,
      applicantId,
      screeningQuestions,
    })

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Dummy success response
    return {
      success: true,
    }

    // TODO: Replace with actual implementation:
    // const response = await fetch(
    //   `${process.env.GETME_API_URL}/vacancy/${vacancyId}/application`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       // Authorization may or may not be required depending on API design
    //     },
    //     body: JSON.stringify({
    //       applicantId,
    //       screeningQuestions,
    //     }),
    //   }
    // )
    //
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}))
    //   return {
    //     success: false,
    //     error: errorData.detail || `Failed to submit application: ${response.status}`,
    //   }
    // }
    //
    // return { success: true }
  } catch (error) {
    console.error("Error submitting screening questions:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit screening questions",
    }
  }
}
