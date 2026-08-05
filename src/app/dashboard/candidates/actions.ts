"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { formString, messagePath } from "@/lib/auth/validation"
import { requireEmployerWorkspace } from "@/lib/employer/session"

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function saveCandidate(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/candidates")
  const candidateId = formString(formData, "candidateId")

  if (!uuidPattern.test(candidateId)) {
    redirect(
      messagePath(
        "/dashboard/candidates",
        "error",
        "The selected candidate is invalid.",
      ),
    )
  }

  const { error } = await workspace.supabase.from("saved_candidates").insert({
    organization_id: workspace.organization.id,
    candidate_id: candidateId,
    saved_by: workspace.userId,
  })

  if (error && error.code !== "23505") {
    redirect(
      messagePath(
        "/dashboard/candidates",
        "error",
        "We could not save this candidate.",
      ),
    )
  }

  revalidatePath("/dashboard/candidates")
  redirect(
    messagePath(
      "/dashboard/candidates",
      "success",
      error?.code === "23505"
        ? "This candidate is already saved."
        : "Candidate saved for your organization.",
    ),
  )
}

export async function removeSavedCandidate(formData: FormData) {
  const workspace = await requireEmployerWorkspace("/dashboard/candidates")
  const candidateId = formString(formData, "candidateId")

  if (!uuidPattern.test(candidateId)) {
    redirect(
      messagePath(
        "/dashboard/candidates",
        "error",
        "The selected candidate is invalid.",
      ),
    )
  }

  const { error } = await workspace.supabase
    .from("saved_candidates")
    .delete()
    .eq("organization_id", workspace.organization.id)
    .eq("candidate_id", candidateId)

  if (error) {
    redirect(
      messagePath(
        "/dashboard/candidates",
        "error",
        "We could not remove this saved candidate.",
      ),
    )
  }

  revalidatePath("/dashboard/candidates")
  redirect(
    messagePath(
      "/dashboard/candidates",
      "success",
      "Candidate removed from saved profiles.",
    ),
  )
}
