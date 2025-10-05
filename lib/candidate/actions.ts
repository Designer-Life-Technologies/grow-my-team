"use server"

import type { Candidate } from "./types"

/**
 * Candidate Actions
 *
 * Server actions for candidate-facing features.
 */

/**
 * Get position details by ID
 *
 * Returns full details of a specific job position from the public API.
 *
 * @param positionId - The ID of the position to fetch
 * @returns Promise<Candidate.Vacancy | null> - Position details or null if not found
 */
export async function getPositionById(
  positionId: string,
): Promise<Candidate.Vacancy | null> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy/${positionId}`,
    )
    const position = (await response.json()) as Candidate.Vacancy

    return position
  } catch (error) {
    console.error("Error fetching position details:", error)
    return null
  }
}
