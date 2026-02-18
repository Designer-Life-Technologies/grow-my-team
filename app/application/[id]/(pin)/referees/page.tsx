import { LayoutGroup } from "framer-motion"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import ApplicantPublicLayout from "@/app/(applicant)/(public)/layout"
import { AddRefereeDialog } from "@/components/applicant/applications/AddRefereeDialog"
import { DeleteRefereeButton } from "@/components/applicant/applications/DeleteRefereeButton"
import { EditRefereeDialog } from "@/components/applicant/applications/EditRefereeDialog"
import { SubmitRefereesButton } from "@/components/applicant/applications/SubmitRefereesButton"
import type {
  ApplicantApplication,
  ApplicationStatusEntry,
  Resume,
  ResumeReferee,
} from "@/lib/applicant"
import {
  addApplicationResumeReferee,
  completeApplicationReferees,
  deleteApplicationResumeReferee,
  getApplicantApplication,
  getApplicationResume,
  getPositionById,
  updateApplicationResumeReferee,
} from "@/lib/applicant"
import {
  isApplicationAuthError,
  redirectToApplicationPin,
} from "@/lib/application/navigation"
import type { RefereeActionState } from "@/lib/application/referee-actions"
import { getApplicantSessionServer } from "@/lib/auth/actions"
import { clearApplicantSession } from "@/lib/auth/applicant-auth"
import { FormValidationError } from "@/lib/validation/contact"

async function handleApplicantAuthFailure(
  error: unknown,
  applicationId: string,
  nextPath: string,
) {
  if (!isApplicationAuthError(error)) return
  await clearApplicantSession()
  redirectToApplicationPin(applicationId, nextPath, {
    reason: "session_expired",
  })
}

async function addResumeRefereeAction(
  _prevState: RefereeActionState,
  formData: FormData,
): Promise<RefereeActionState> {
  "use server"

  const applicationId = formData.get("applicationId")?.toString()
  if (!applicationId) {
    throw new Error("Missing application ID for referee creation")
  }

  const redirectPath =
    formData.get("redirectPath")?.toString() ||
    `/application/${applicationId}/referees`

  try {
    await addApplicationResumeReferee(applicationId, {
      name: (formData.get("name")?.toString() || "").trim(),
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
      position: formData.get("position")?.toString() || null,
      company: formData.get("company")?.toString() || null,
      relationship: formData.get("relationship")?.toString() || null,
      applicantPosition: formData.get("applicantPosition")?.toString() || null,
    })
  } catch (error) {
    if (error instanceof FormValidationError) {
      return { error: error.message }
    }
    await handleApplicantAuthFailure(error, applicationId, redirectPath)
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't save your referee. Please try again."
    return { error: message }
  }

  revalidatePath(redirectPath)
  return { success: true }
}

async function deleteRefereeAction(
  _prevState: RefereeActionState,
  formData: FormData,
): Promise<RefereeActionState> {
  "use server"

  const applicationId = formData.get("applicationId")?.toString()
  const refereeId = formData.get("refereeId")?.toString()
  if (!applicationId || !refereeId) {
    throw new Error("Missing identifiers for referee deletion")
  }

  const redirectPath =
    formData.get("redirectPath")?.toString() ||
    `/application/${applicationId}/referees`

  try {
    await deleteApplicationResumeReferee(applicationId, refereeId)
  } catch (error) {
    await handleApplicantAuthFailure(error, applicationId, redirectPath)
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't remove this referee. Please try again."
    return { error: message }
  }

  revalidatePath(redirectPath)
  return { success: true }
}

async function completeRefereesAction(
  _prevState: RefereeActionState,
  formData: FormData,
): Promise<RefereeActionState> {
  "use server"

  const applicationId = formData.get("applicationId")?.toString()
  if (!applicationId) {
    throw new Error("Missing application ID for referee submission")
  }

  const redirectPath =
    formData.get("redirectPath")?.toString() ||
    `/application/${applicationId}/referees/thank-you`

  try {
    const resume = await getApplicationResume(applicationId)
    const refereeCount = resume.referees?.length ?? 0
    if (refereeCount < 1) {
      return { error: "Add at least one referee before submitting." }
    }

    await completeApplicationReferees(applicationId)
  } catch (error) {
    await handleApplicantAuthFailure(error, applicationId, redirectPath)
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't submit your referees. Please try again."
    return { error: message }
  }

  revalidatePath(`/application/${applicationId}/referees`)
  revalidatePath(redirectPath)
  return { success: true }
}

async function updateResumeRefereeAction(
  _prevState: RefereeActionState,
  formData: FormData,
): Promise<RefereeActionState> {
  "use server"

  const applicationId = formData.get("applicationId")?.toString()
  const refereeId = formData.get("refereeId")?.toString()
  if (!applicationId || !refereeId) {
    throw new Error("Missing identifiers for referee update")
  }

  const redirectPath =
    formData.get("redirectPath")?.toString() ||
    `/application/${applicationId}/referees`

  try {
    await updateApplicationResumeReferee(applicationId, refereeId, {
      name: (formData.get("name")?.toString() || "").trim(),
      email: formData.get("email")?.toString() || null,
      phone: formData.get("phone")?.toString() || null,
      position: formData.get("position")?.toString() || null,
      company: formData.get("company")?.toString() || null,
      relationship: formData.get("relationship")?.toString() || null,
      applicantPosition: formData.get("applicantPosition")?.toString() || null,
    })
  } catch (error) {
    if (error instanceof FormValidationError) {
      return { error: error.message }
    }
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't update your referee. Please try again."
    return { error: message }
  }

  revalidatePath(redirectPath)
  return { success: true }
}

export default async function ApplicationRefereesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { isApplicant, isApplicationUser, user } =
    await getApplicantSessionServer()
  const refereesPath = `/application/${id}/referees`
  const refereesThankYouPath = `${refereesPath}/thank-you`

  if (!isApplicant && !isApplicationUser) {
    const nextParam = encodeURIComponent(refereesPath)
    redirect(`/application/${id}/pin?next=${nextParam}`)
  }

  if (isApplicationUser && user?.pinAction && user.pinAction !== "REFEREES") {
    const nextParam = encodeURIComponent(refereesPath)
    redirect(`/application/${id}/pin?next=${nextParam}`)
  }

  const vacancy = user?.vacancyId ? await getPositionById(user.vacancyId) : null

  let application: ApplicantApplication
  try {
    application = await getApplicantApplication(id)
  } catch (error) {
    await handleApplicantAuthFailure(error, id, refereesPath)
    throw error
  }

  const hasCompletedReferees = application?.statusHistory?.some(
    (entry: ApplicationStatusEntry) => entry.status === "REFEREES_COMPLETED",
  )

  if (hasCompletedReferees) {
    redirect(refereesThankYouPath)
  }

  let resume: Resume
  try {
    resume = await getApplicationResume(id)
  } catch (error) {
    await handleApplicantAuthFailure(error, id, `/application/${id}/referees`)
    throw error
  }
  const positionTitle =
    vacancy?.candidateSourcing?.advert?.title ||
    vacancy?.jobDescription?.title ||
    ""
  const referees = resume.referees || []
  const resumePositions = resume.positions || []

  return (
    <ApplicantPublicLayout>
      <section className="mx-auto max-w-3xl animate-in fade-in duration-700">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            Please provide your referees
          </h1>
          <p className="mt-2 text-base font-semibold text-foreground">
            {positionTitle}
          </p>
        </header>

        <div className="mt-8 space-y-4 text-muted-foreground">
          <p>
            To help us complete our assessment, please provide the details for
            your professional referees.
          </p>
          <p>
            Add recent managers or colleagues who can confidently speak about
            your work experience for this role.
          </p>
        </div>

        <div className="mt-10 flex justify-end">
          <AddRefereeDialog
            applicationId={id}
            redirectPath={refereesPath}
            formAction={addResumeRefereeAction}
            resumePositions={resumePositions}
          />
        </div>

        <div>
          {!referees.length ? (
            <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-sm text-muted-foreground">
              No referees added yet.
            </div>
          ) : (
            <LayoutGroup>
              <div className="mt-6 space-y-6">
                {referees.map((referee: ResumeReferee) => (
                  <RefereeCard
                    key={referee.id || referee.name}
                    referee={referee}
                    applicationId={id}
                    redirectPath={refereesPath}
                    resumePositions={resumePositions}
                  />
                ))}
              </div>
            </LayoutGroup>
          )}
        </div>

        {referees.length > 0 ? (
          <div className="mt-10 pt-8">
            <h3 className="text-lg font-semibold text-foreground">
              Ready to submit your referees?
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Please double-check their details and let them know we&apos;ll
                reach out. They&apos;ll receive an email with instructions
                shortly after you submit.
              </p>
              <p>
                By submitting your referees, you are consenting to our use of
                their contact information to verify your work experience.
              </p>
            </div>
            <div className="mt-4">
              <SubmitRefereesButton
                applicationId={id}
                redirectPath={refereesThankYouPath}
                formAction={completeRefereesAction}
                hasReferees={referees.length > 0}
              />
            </div>
          </div>
        ) : null}
      </section>
    </ApplicantPublicLayout>
  )
}

function RefereeCard({
  referee,
  applicationId,
  redirectPath,
  resumePositions,
}: {
  referee: ResumeReferee
  applicationId: string
  redirectPath: string
  resumePositions: Resume["positions"]
}) {
  const isEditable = Boolean(referee?.id)

  return (
    <div className="group relative">
      {isEditable ? (
        <EditRefereeDialog
          referee={referee}
          applicationId={applicationId}
          redirectPath={redirectPath}
          formAction={updateResumeRefereeAction}
          resumePositions={resumePositions}
          trigger={
            <button
              type="button"
              aria-label={`Edit ${referee.name}`}
              className="absolute inset-0 z-10 w-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
            />
          }
        />
      ) : null}

      <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm transition-colors group-hover:border-primary/70">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-foreground">
              {referee.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {referee.position || "Role unknown"} ·{" "}
              {referee.company || "Company unknown"}
            </p>
          </div>
          {isEditable ? (
            <div className="relative z-20 flex items-center gap-1.5">
              <EditRefereeDialog
                referee={referee}
                applicationId={applicationId}
                redirectPath={redirectPath}
                formAction={updateResumeRefereeAction}
                resumePositions={resumePositions}
                triggerVariant="icon"
                triggerLabel={`Edit ${referee.name}`}
                triggerClassName="text-muted-foreground hover:text-white focus-visible:text-white"
              />
              <DeleteRefereeButton
                applicationId={applicationId}
                refereeId={referee.id as string}
                redirectPath={redirectPath}
                refereeName={referee.name}
                formAction={deleteRefereeAction}
              />
            </div>
          ) : null}
        </div>

        {!isEditable ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This referee came from your resume and can’t be edited yet because
            no unique identifier was provided.
          </p>
        ) : null}
      </div>
    </div>
  )
}
