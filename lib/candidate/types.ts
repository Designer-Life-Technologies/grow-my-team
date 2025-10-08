import type {
  Advert,
  Email,
  Industry,
  Phone,
  Seniority,
  VacancyType,
  WorkplaceType,
} from "../types"

/**
 * Applicant interface matching the API response format
 * Note: API uses lowercase field names (firstname, lastname, mobile)
 */
export interface Applicant {
  id: string
  firstname: string
  lastname: string
  email: Email | string
  mobile: Phone | string
  linkedInUrl?: string
}

/**
 * Screening questions data
 */
export interface ScreeningQuestionsData {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
}

/**
 * Screening answer with question and answer pair
 */
export interface ScreeningAnswer {
  question: string
  answer: string
}

/**
 * Candidate namespace
 *
 * Contains all types related to candidate-facing features like job positions,
 * vacancy details, and candidate sourcing.
 */
export namespace Candidate {
  export interface JobDescription {
    title: string
    location: string
    type: VacancyType
    workplaceType: WorkplaceType
    skills: string[]
    personality: string[]
    qualifications: string[]
    industry: Industry
    seniority: Seniority
    salary: string
    reportingTo: string
  }

  export interface CandidateSourcing {
    advert: Advert
    status?: "DRAFT" | "OPEN" | "CLOSED"
  }

  export interface Position {
    id: string
    jobDescription: JobDescription
    candidateSourcing: CandidateSourcing
    updated: string
    created: string
  }
}
