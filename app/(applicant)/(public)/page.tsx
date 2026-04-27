import type { Metadata } from "next"
import { getOrganisationId, setupApiContext } from "@/lib/api/context"
import { getOpenPositions } from "@/lib/applicant"
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

  // Set up API context globally for this request
  await setupApiContext(params)

  // Use URL parameter if provided (for testing), otherwise get from global context
  const organisationId = urlOrganisationId || getOrganisationId()

  console.log(
    `[ApplicantPage] ✓ Using organisationId: ${organisationId || "none"}`,
  )

  // Fetch open positions from the API, filtered by organisation if available
  const positions = await getOpenPositions(organisationId || undefined)

  return <PositionsClient vacancies={positions} />
}
