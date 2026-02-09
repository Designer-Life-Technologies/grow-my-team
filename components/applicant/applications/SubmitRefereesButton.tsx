"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { RefereeActionState } from "@/lib/application/referee-actions"

const initialState: RefereeActionState = {
  error: undefined,
  success: false,
}

interface SubmitRefereesButtonProps {
  applicationId: string
  redirectPath: string
  formAction: (
    prevState: RefereeActionState,
    formData: FormData,
  ) => Promise<RefereeActionState>
  hasReferees: boolean
}

export function SubmitRefereesButton({
  applicationId,
  redirectPath,
  formAction,
  hasReferees,
}: SubmitRefereesButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverState, setServerState] =
    useState<RefereeActionState>(initialState)
  const [isPending, startTransition] = useTransition()

  const disabled = !hasReferees || isPending

  useEffect(() => {
    if (!open) {
      setServerState(initialState)
    }
  }, [open])

  const handleConfirm = () => {
    const formData = new FormData()
    formData.set("applicationId", applicationId)
    formData.set("redirectPath", redirectPath)

    startTransition(async () => {
      const result = await formAction(initialState, formData)
      setServerState(result)
      if (result.success) {
        setOpen(false)
        toast.success("Referees submitted", {
          description: "",
          position: "top-center",
          duration: 2500,
        })
        router.push(redirectPath)
      }
    })
  }

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="min-w-[220px]" disabled={disabled}>
            {hasReferees ? "Submit Referees" : "Add a referee first"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Your Referees</DialogTitle>
            <DialogDescription>
              Once submitted, our team will begin contacting your referees.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Confirm that you've let your referees know we'll be in touch.
              They'll receive an email with instructions on how to provide their
              feedback.
            </p>
            {serverState.error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-destructive">
                {serverState.error}
              </p>
            ) : null}
          </div>
          <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Referees"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {!hasReferees ? (
        <p className="text-sm text-muted-foreground">
          Add at least one referee before submitting.
        </p>
      ) : null}
    </div>
  )
}
