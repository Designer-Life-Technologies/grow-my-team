"use client"

import { Pencil } from "lucide-react"
import { type ReactNode, useState } from "react"
import { RefereeForm } from "@/components/applicant/applications/RefereeForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Resume, ResumeReferee } from "@/lib/applicant"
import type { RefereeActionState } from "@/lib/application/referee-actions"
import { cn } from "@/lib/utils"

interface EditRefereeDialogProps {
  referee: ResumeReferee
  applicationId: string
  redirectPath: string
  formAction: (
    prevState: RefereeActionState,
    formData: FormData,
  ) => Promise<RefereeActionState>
  resumePositions?: Resume["positions"]
  triggerVariant?: "text" | "icon"
  triggerLabel?: string
  triggerClassName?: string
  trigger?: ReactNode
}

export function EditRefereeDialog({
  referee,
  applicationId,
  redirectPath,
  formAction,
  resumePositions,
  triggerVariant = "text",
  triggerLabel,
  triggerClassName,
  trigger,
}: EditRefereeDialogProps) {
  const [open, setOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setResetKey((prev) => prev + 1)
    }
  }

  const handleSuccess = () => {
    setOpen(false)
    setResetKey((prev) => prev + 1)
  }

  const triggerButtonLabel = triggerLabel ?? "Edit"

  const renderTrigger = () => {
    if (trigger) {
      return trigger
    }

    if (triggerVariant === "icon") {
      return (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-foreground",
            triggerClassName,
          )}
          aria-label={triggerButtonLabel}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
      )
    }

    return (
      <Button
        type="button"
        variant="outline"
        className={cn("min-w-24", triggerClassName)}
        aria-label={triggerButtonLabel}
      >
        {triggerButtonLabel}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit referee</DialogTitle>
          <DialogDescription>
            Update this contact’s information so our team can reach them
            quickly.
          </DialogDescription>
        </DialogHeader>
        <RefereeForm
          applicationId={applicationId}
          redirectPath={redirectPath}
          referee={referee}
          formAction={formAction}
          submitLabel="Save Changes"
          onSuccess={handleSuccess}
          resetKey={resetKey}
          resumePositions={resumePositions}
        />
      </DialogContent>
    </Dialog>
  )
}
