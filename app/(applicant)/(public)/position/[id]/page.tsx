import type { Metadata } from "next"
import { Suspense } from "react"
import { PositionDetail, PositionDetailSkeleton } from "@/components/applicant"

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
  const { organisationId } = await searchParams

  return (
    <Suspense fallback={<PositionDetailSkeleton />}>
      <PositionDetail positionId={id} organisationId={organisationId} />
    </Suspense>
  )
}
