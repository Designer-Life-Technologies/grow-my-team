/**
 * Candidate-related types
 *
 * Types used for job positions and candidate-facing features.
 */

/**
 * Job position type
 */
export interface Position {
  id: string
  title: string
  company: string
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Internship"
  tags: string[]
  description: string
  applicationInstructions: string
  salary?: string
  postedDate: string
  status: "open" | "closed" | "draft"
}

/**
 * Simplified position for list views
 */
export interface PositionSummary {
  id: string
  title: string
  company: string
  location: string
  type: string
  tags: string[]
  postedDate: string
}
