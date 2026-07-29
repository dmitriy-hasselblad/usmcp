"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireIdentity } from "@/lib/auth/session"
import {
  careerStages,
  formString,
  isUsState,
  messagePath,
  professions,
} from "@/lib/auth/validation"
import {
  isAllowedProfessionalDocument,
  isProfessionalDocumentType,
  professionalDocumentMaxBytes,
  professionalDocumentsBucket,
  type ProfessionalDocumentType,
} from "@/lib/professional/constants"

type UploadActionResult = {
  ok: boolean
  message: string
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const safeStorageFileNamePattern =
  /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,254}$/

export async function updateProfessionalProfile(formData: FormData) {
  const identity = await requireIdentity("/dashboard/profile")
  const firstName = formString(formData, "firstName")
  const lastName = formString(formData, "lastName")
  const profession = formString(formData, "profession")
  const specialty = formString(formData, "specialty")
  const careerStage = formString(formData, "careerStage")
  const stateCode = formString(formData, "stateCode")
  const headline = formString(formData, "headline")
  const city = formString(formData, "city")
  const phone = formString(formData, "phone")
  const biography = formString(formData, "biography")
  const yearsExperienceValue = formString(formData, "yearsExperience")
  const yearsExperience = yearsExperienceValue
    ? Number(yearsExperienceValue)
    : null

  if (
    firstName.length < 2 ||
    firstName.length > 80 ||
    lastName.length < 2 ||
    lastName.length > 80 ||
    !professions.some((option) => option === profession) ||
    !careerStages.some((option) => option === careerStage) ||
    !isUsState(stateCode) ||
    (specialty.length > 0 && specialty.length < 2) ||
    specialty.length > 120 ||
    (headline.length > 0 && headline.length < 2) ||
    headline.length > 160 ||
    (city.length > 0 && city.length < 2) ||
    city.length > 120 ||
    (phone.length > 0 && phone.length < 7) ||
    phone.length > 30 ||
    biography.length > 2000 ||
    (yearsExperience !== null &&
      (!Number.isInteger(yearsExperience) ||
        yearsExperience < 0 ||
        yearsExperience > 70))
  ) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "Review the professional profile fields and try again.",
      ),
    )
  }

  const { data: account } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (
    account?.account_type !== "professional" ||
    !account.onboarding_completed
  ) {
    redirect("/onboarding")
  }

  const { error: profileError } = await identity.supabase
    .from("professional_profiles")
    .update({
      profession,
      specialty: specialty || null,
      career_stage: careerStage,
      state_code: stateCode,
      headline: headline || null,
      city: city || null,
      phone: phone || null,
      biography: biography || null,
      years_experience: yearsExperience,
    })
    .eq("user_id", identity.userId)

  if (profileError) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "We could not update your professional profile.",
      ),
    )
  }

  const { error: nameError } = await identity.supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", identity.userId)

  if (nameError) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "Professional details were saved, but your name could not be updated.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  redirect(
    messagePath(
      "/dashboard/profile",
      "success",
      "Professional profile updated.",
    ),
  )
}

export async function registerProfessionalDocument(
  formData: FormData,
): Promise<UploadActionResult> {
  const identity = await requireIdentity("/dashboard/profile")
  const documentId = formString(formData, "documentId")
  const documentTypeValue = formString(formData, "documentType")
  const title = formString(formData, "title")
  const storagePath = formString(formData, "storagePath")
  const fileName = formString(formData, "fileName")
  const mimeType = formString(formData, "mimeType")
  const fileSize = Number(formString(formData, "fileSize"))
  const makePrimary = formString(formData, "makePrimary") === "true"

  if (
    !uuidPattern.test(documentId) ||
    !isProfessionalDocumentType(documentTypeValue) ||
    title.length < 1 ||
    title.length > 120 ||
    !safeStorageFileNamePattern.test(fileName) ||
    storagePath !== `${identity.userId}/${documentId}/${fileName}` ||
    !Number.isInteger(fileSize) ||
    fileSize < 1 ||
    fileSize > professionalDocumentMaxBytes ||
    !isAllowedProfessionalDocument(documentTypeValue, mimeType)
  ) {
    return {
      ok: false,
      message: "The document details are invalid.",
    }
  }

  const { data: account } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (
    account?.account_type !== "professional" ||
    !account.onboarding_completed
  ) {
    return {
      ok: false,
      message: "A completed professional account is required.",
    }
  }

  const folderPath = `${identity.userId}/${documentId}`
  const { data: objects, error: storageError } = await identity.supabase.storage
    .from(professionalDocumentsBucket)
    .list(folderPath, {
      limit: 10,
      search: fileName,
    })

  const uploadedObject = objects?.find((object) => object.name === fileName)
  const metadata = uploadedObject?.metadata as
    | { mimetype?: string; size?: number }
    | null
    | undefined

  if (
    storageError ||
    !uploadedObject ||
    metadata?.size !== fileSize ||
    (metadata?.mimetype && metadata.mimetype !== mimeType)
  ) {
    return {
      ok: false,
      message: "We could not verify the uploaded document.",
    }
  }

  const documentType = documentTypeValue as ProfessionalDocumentType
  const { error: insertError } = await identity.supabase
    .from("professional_documents")
    .insert({
      id: documentId,
      user_id: identity.userId,
      document_type: documentType,
      title,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType,
      file_size: fileSize,
      is_primary: false,
    })

  if (insertError) {
    return {
      ok: false,
      message: "We could not add this document to your profile.",
    }
  }

  if (documentType === "resume") {
    const { data: currentPrimary } = await identity.supabase
      .from("professional_documents")
      .select("id")
      .eq("user_id", identity.userId)
      .eq("document_type", "resume")
      .eq("is_primary", true)
      .maybeSingle()

    if (makePrimary || !currentPrimary) {
      const { error: primaryError } = await identity.supabase.rpc(
        "set_primary_professional_resume",
        {
          target_document_id: documentId,
        },
      )

      if (primaryError) {
        await identity.supabase
          .from("professional_documents")
          .delete()
          .eq("id", documentId)
          .eq("user_id", identity.userId)

        return {
          ok: false,
          message: "The resume was uploaded, but could not be activated.",
        }
      }
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")

  return {
    ok: true,
    message: "Document uploaded securely.",
  }
}

export async function setPrimaryResume(formData: FormData) {
  const identity = await requireIdentity("/dashboard/profile")
  const documentId = formString(formData, "documentId")

  if (!uuidPattern.test(documentId)) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "The selected resume is invalid.",
      ),
    )
  }

  const { error } = await identity.supabase.rpc(
    "set_primary_professional_resume",
    {
      target_document_id: documentId,
    },
  )

  if (error) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "We could not set the primary resume.",
      ),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  redirect(
    messagePath(
      "/dashboard/profile",
      "success",
      "Primary resume updated.",
    ),
  )
}

export async function deleteProfessionalDocument(formData: FormData) {
  const identity = await requireIdentity("/dashboard/profile")
  const documentId = formString(formData, "documentId")

  if (!uuidPattern.test(documentId)) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "The selected document is invalid.",
      ),
    )
  }

  const { data: document } = await identity.supabase
    .from("professional_documents")
    .select("storage_path, document_type, is_primary")
    .eq("id", documentId)
    .eq("user_id", identity.userId)
    .maybeSingle()

  if (!document) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "The selected document is unavailable.",
      ),
    )
  }

  const { error: deleteError } = await identity.supabase
    .from("professional_documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", identity.userId)

  if (deleteError?.code === "23503") {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "This resume is attached to an application and cannot be deleted.",
      ),
    )
  }

  if (deleteError) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        "We could not remove this document.",
      ),
    )
  }

  await identity.supabase.storage
    .from(professionalDocumentsBucket)
    .remove([document.storage_path])

  if (document.document_type === "resume" && document.is_primary) {
    const { data: nextResume } = await identity.supabase
      .from("professional_documents")
      .select("id")
      .eq("user_id", identity.userId)
      .eq("document_type", "resume")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (nextResume) {
      await identity.supabase.rpc("set_primary_professional_resume", {
        target_document_id: nextResume.id,
      })
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  redirect(
    messagePath("/dashboard/profile", "success", "Document removed."),
  )
}
