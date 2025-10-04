import type {
  Advert,
  Industry,
  Seniority,
  VacancyType,
  WorkplaceType,
} from "../types"

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

  export interface Vacancy {
    id: string
    jobDescription: JobDescription
    candidateSourcing: CandidateSourcing
    updated: string
    created: string
  }
}
