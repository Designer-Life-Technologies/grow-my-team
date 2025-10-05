import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PositionApply, PositionApplySkeleton } from "@/components/candidate"
import { getPositionById } from "@/lib/candidate"

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const vacancy = await getPositionById(id)

  const title = vacancy?.candidateSourcing?.advert?.title || "Position"

  return {
    title: `Apply for ${title} | Grow My Team`,
    description: "Apply for this position by uploading your resume",
  }
}

export default async function ApplyPage({ params }: PageProps) {
  const { id } = await params
  const vacancy = await getPositionById(id)

  if (!vacancy || !vacancy.candidateSourcing?.advert) {
    notFound()
  }

  const positionTitle =
    vacancy.candidateSourcing.advert.title || "Untitled Position"

  return (
    <Suspense fallback={<PositionApplySkeleton />}>
      <PositionApply positionId={id} positionTitle={positionTitle} />
    </Suspense>
  )
}
