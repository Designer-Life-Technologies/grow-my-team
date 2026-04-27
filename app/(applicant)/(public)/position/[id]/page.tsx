import type { Metadata } from "next"
import { Suspense } from "react"
import { PositionDetail, PositionDetailSkeleton } from "@/components/applicant"
import { getOrganisationIdBySlug } from "@/lib/db/themes"
import { resolveTheme } from "@/lib/theme/resolver"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ organisationId?: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  // In a real app, fetch the position to generate a rich title/description.
  // For now, use the ID as a placeholder.
  return {
    title: `Position ${id} | Grow My Team`,
    description: "Position details page",
  }
}

export default async function ApplicantPositionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  const paramsData = await searchParams
  const urlOrganisationId = paramsData.organisationId

  let organisationId: string | null = null

  if (urlOrganisationId) {
    // Use URL parameter if provided (for testing)
    organisationId = urlOrganisationId
    console.log(
      `[PositionDetailPage] Using organisationId from URL: ${organisationId}`,
    )
  } else {
    // Resolve theme to determine customer/organisation
    const { theme } = await resolveTheme()
    console.log(`[PositionDetailPage] Resolved theme: ${theme.id}`)

    organisationId = await getOrganisationIdBySlug(theme.id)
    console.log(
      `[PositionDetailPage] Organisation ID from theme: ${organisationId}`,
    )
  }

  return (
    <Suspense fallback={<PositionDetailSkeleton />}>
      <PositionDetail
        positionId={id}
        organisationId={organisationId || undefined}
      />
    </Suspense>
  )
}
