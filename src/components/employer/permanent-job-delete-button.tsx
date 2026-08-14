"use client"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PermanentJobDeleteButton({
  action,
  jobId,
  jobTitle,
}: {
  action: (formData: FormData) => void
  jobId: string
  jobTitle: string
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Permanently delete “${jobTitle}”? This cannot be undone. Jobs with applications cannot be deleted.`,
          )
        ) {
          event.preventDefault()
        }
      }}
    >
      <input name="jobId" type="hidden" value={jobId} />
      <Button type="submit" variant="destructive">
        <Trash2 />
        Delete permanently
      </Button>
    </form>
  )
}
