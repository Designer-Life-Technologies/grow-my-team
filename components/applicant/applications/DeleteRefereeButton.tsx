"use client"

import { Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
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

interface DeleteRefereeButtonProps {
  applicationId: string
  refereeId: string
  redirectPath: string
  refereeName?: string
  formAction: (
    prevState: RefereeActionState,
    formData: FormData,
  ) => Promise<RefereeActionState>
}

export function DeleteRefereeButton({
  applicationId,
  refereeId,
  redirectPath,
  refereeName,
  formAction,
}: DeleteRefereeButtonProps) {
  const [open, setOpen] = useState(false)
  const [serverState, setServerState] =
    useState<RefereeActionState>(initialState)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    const formData = new FormData()
    formData.set("applicationId", applicationId)
    formData.set("redirectPath", redirectPath)
    formData.set("refereeId", refereeId)

    startTransition(async () => {
      const result = await formAction(initialState, formData)
      setServerState(result)
      if (result.success) {
        setOpen(false)
        toast.success("Referee removed", {
          description: refereeName
            ? `${refereeName} won't appear in your list anymore.`
            : "They won't appear in your list anymore.",
          position: "top-center",
          duration: 2200,
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete referee"
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Remove {refereeName ? ` ${refereeName} ` : " this contact "}
            in your list of referees.
          </DialogDescription>
        </DialogHeader>
        {serverState.error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
            {serverState.error}
          </p>
        ) : null}
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Removing..." : "Remove Referee"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
