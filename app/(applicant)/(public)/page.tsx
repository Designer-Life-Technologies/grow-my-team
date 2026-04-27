import type { Metadata } from "next"
import { getOpenPositions } from "@/lib/applicant"
import { resolveClientConfig } from "@/lib/config/client-config"
import PositionsClient from "./PositionsClient"

export const metadata: Metadata = {
  title: "Positions | Grow My Team",
  description: "Search and browse open positions",
}

export default async function ApplicantPositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ organisationId?: string; theme?: string }>
}) {
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
    // Use unified client config resolver
    const config = await resolveClientConfig(params)
    organisationId = config.organisationId
    console.log(
      `[ApplicantPage] Organisation ID from config: ${organisationId}`,
    )
  }

  console.log(
    `[ApplicantPage] ✓ Using organisationId: ${organisationId || "none"}`,
  )

  // Fetch open positions from the API, filtered by organisation if available
  const positions = await getOpenPositions(organisationId || undefined)

  return <PositionsClient vacancies={positions} />
}
