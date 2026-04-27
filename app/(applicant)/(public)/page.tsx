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
  let themeParam: string | null = null

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
    themeParam = config.theme.id
    console.log(
      `[ApplicantPage] Organisation ID from config: ${organisationId}`,
    )
    console.log(`[ApplicantPage] Theme from config: ${themeParam}`)
  }

  console.log(
    `[ApplicantPage] ✓ Using organisationId: ${organisationId || "none"}`,
  )
  console.log(`[ApplicantPage] ✓ Using theme: ${themeParam || "default"}`)

  // Fetch open positions from the API, filtered by organisation if available
  // Pass theme parameter to ensure theme-specific API endpoint is used
  const positions = await getOpenPositions(
    organisationId || undefined,
    themeParam || undefined,
  )

  return <PositionsClient vacancies={positions} />
}
