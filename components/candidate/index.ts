/**
 * Candidate Components
 *
 * Components used in the public-facing candidate section of the application.
 * These components are optimized for candidate experience and job discovery.
 *
 * Organized into three categories:
 * - positions: Components for displaying open positions and position details
 * - applications: Components for the job application process
 * - applicant: Components related to applicant user interface
 */

// Applicant components
export { ApplicantUserMenu } from "./applicant"

// Application components
export {
  ApplicationForm,
  ApplicationSuccess,
  PositionApply,
  PositionApplySkeleton,
  ResumeDropzone,
  ScreeningQuestionsForm,
} from "./applications"
// Position components
export { PositionDetail, PositionDetailSkeleton } from "./positions"
