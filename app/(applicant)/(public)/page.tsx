import type { Metadata } from "next"
import { getOpenPositions } from "@/lib/applicant"
import { getOrganisationIdBySlug } from "@/lib/db/themes"
import { resolveTheme } from "@/lib/theme/resolver"
import PositionsClient from "./PositionsClient"

export const metadata: Metadata = {
  title: "Positions | Grow My Team",
  description: "Search and browse open positions",
}

export default async function ApplicantPositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ organisationId?: string }>
}) {
  // Check for organisationId URL parameter (for testing)
  const params = await searchParams
  const urlOrganisationId = params.organisationId

  let organisationId: string | null = null

  if (urlOrganisationId) {
    // Use URL parameter if provided (for testing)
    organisationId = urlOrganisationId
    console.log(
      `[ApplicantPage] Using organisationId from URL: ${organisationId}`,
    )
  } else {
    // Resolve theme to determine customer/organisation
    const { theme } = await resolveTheme()
    console.log(`[ApplicantPage] Resolved theme: ${theme.id}`)

    organisationId = await getOrganisationIdBySlug(theme.id)
    console.log(`[ApplicantPage] Organisation ID from theme: ${organisationId}`)
  }

  // Fetch open positions from the API, filtered by organisation if available
  const positions = await getOpenPositions(organisationId || undefined)

  return <PositionsClient vacancies={positions} />
}
