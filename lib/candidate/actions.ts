"use server"

import type { Vacancy } from "@/lib/types"

/**
 * Candidate Actions
 *
 * Server actions for candidate-facing features like browsing job positions.
 * These actions are public and do not require authentication.
 */

/**
 * Get all available positions
 *
 * Returns a list of all open job positions for candidates to browse.
 * Currently returns placeholder data.
 *
 */
// export async function getAllPositions(): Promise<Vacancy[]> {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 100))

//   // Filter only open positions and return summary data
// }

/**
 * Get position details by ID
 *
 * Returns full details of a specific job position.
 * Currently returns placeholder data.
 *
 * @param positionId - The ID of the position to fetch
 * @returns Promise<Position | null> - Position details or null if not found
 *
 * TODO: Replace with actual API call:
 * const position = await fetch(`${process.env.GETME_API_URL}/v1/public/positions/${positionId}`)
 */
export async function getPositionById(
  positionId: string,
): Promise<Vacancy | null> {
  try {
    const response = await fetch(
      `${process.env.GETME_API_URL}/public/vacancy/${positionId}`,
    )
    const position = await response.json()
    console.log(position)
    return position
  } catch (error) {
    console.error("Error fetching position details:", error)
    return null
  }
}
