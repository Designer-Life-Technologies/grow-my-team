import type { Metadata } from "next"
import { Suspense } from "react"
import { PositionDetail, PositionDetailSkeleton } from "@/components/candidate"

type PageProps = {
  params: Promise<{ id: string }>
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

export default async function CandidatePositionDetailPage({
  params,
}: PageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<PositionDetailSkeleton />}>
      <PositionDetail positionId={id} />
    </Suspense>
  )
}
