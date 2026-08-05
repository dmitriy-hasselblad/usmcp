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
  professionalPhotoMaxBytes,
  professionalPhotoMimeTypes,
  professionalPhotosBucket,
  profileVisibilities,
  skillProficiencies,
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
  const languages = Array.from(
    new Set(
      formString(formData, "languages")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
  const profileVisibility = formString(formData, "profileVisibility")
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
    languages.length > 12 ||
    languages.some((language) => language.length < 2 || language.length > 60) ||
    !profileVisibilities.some((value) => value === profileVisibility) ||
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

  const { data: updatedProfile, error: profileError } = await identity.supabase
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
      languages,
      profile_visibility: profileVisibility,
    })
    .eq("user_id", identity.userId)
    .select("profile_visibility")
    .maybeSingle()

  if (
    profileError ||
    !updatedProfile ||
    updatedProfile.profile_visibility !== profileVisibility
  ) {
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

export async function saveProfessionalSkill(formData: FormData) {
  const identity = await requireIdentity("/dashboard/profile")
  const skillId = formString(formData, "skillId")
  const name = formString(formData, "name")
  const proficiency = formString(formData, "proficiency")
  const yearsValue = formString(formData, "yearsExperience")
  const yearsExperience = yearsValue ? Number(yearsValue) : null

  if (
    (skillId && !uuidPattern.test(skillId)) ||
    name.length < 2 ||
    name.length > 80 ||
    !skillProficiencies.some((value) => value === proficiency) ||
    (yearsExperience !== null &&
      (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 70))
  ) {
    redirect(messagePath("/dashboard/profile", "error", "Review the skill details and try again."))
  }

  const query = skillId
    ? identity.supabase
        .from("professional_skills")
        .update({ name, proficiency, years_experience: yearsExperience })
        .eq("id", skillId)
        .eq("user_id", identity.userId)
    : identity.supabase.from("professional_skills").insert({
        user_id: identity.userId,
        name,
        proficiency,
        years_experience: yearsExperience,
      })

  if (!skillId) {
    const { count } = await identity.supabase
      .from("professional_skills")
      .select("id", { count: "exact", head: true })
      .eq("user_id", identity.userId)
    if ((count ?? 0) >= 30) {
      redirect(messagePath("/dashboard/profile", "error", "A profile can include up to 30 skills."))
    }
  }
  const { error } = await query

  if (error) {
    redirect(
      messagePath(
        "/dashboard/profile",
        "error",
        error.code === "23505" ? "This skill is already in your profile." : "We could not save this skill.",
      ),
    )
  }

  revalidatePath("/dashboard/profile")
  redirect(messagePath("/dashboard/profile", "success", skillId ? "Skill updated." : "Skill added."))
}

export async function deleteProfessionalSkill(formData: FormData) {
  const identity = await requireIdentity("/dashboard/profile")
  const skillId = formString(formData, "skillId")
  if (!uuidPattern.test(skillId)) {
    redirect(messagePath("/dashboard/profile", "error", "The selected skill is invalid."))
  }
  const { error } = await identity.supabase
    .from("professional_skills")
    .delete()
    .eq("id", skillId)
    .eq("user_id", identity.userId)
  if (error) {
    redirect(messagePath("/dashboard/profile", "error", "We could not remove this skill."))
  }
  revalidatePath("/dashboard/profile")
  redirect(messagePath("/dashboard/profile", "success", "Skill removed."))
}

export async function registerProfessionalPhoto(formData: FormData): Promise<UploadActionResult> {
  const identity = await requireIdentity("/dashboard/profile")
  const storagePath = formString(formData, "storagePath")
  const mimeType = formString(formData, "mimeType")
  const fileSize = Number(formString(formData, "fileSize"))
  const pathParts = storagePath.split("/")
  const [ownerId, photoId, fileName] = pathParts
  const expectedFileName =
    mimeType === "image/png"
      ? "profile.png"
      : mimeType === "image/webp"
        ? "profile.webp"
        : mimeType === "image/jpeg"
          ? "profile.jpg"
          : ""

  if (
    pathParts.length !== 3 ||
    ownerId !== identity.userId ||
    !uuidPattern.test(photoId ?? "") ||
    fileName !== expectedFileName ||
    !professionalPhotoMimeTypes.some((value) => value === mimeType) ||
    !Number.isInteger(fileSize) ||
    fileSize < 1 ||
    fileSize > professionalPhotoMaxBytes
  ) {
    return { ok: false, message: "The photo details are invalid." }
  }

  const folderPath = `${identity.userId}/${photoId}`
  const { data: objects, error: storageError } = await identity.supabase.storage
    .from(professionalPhotosBucket)
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
    return { ok: false, message: "We could not verify the uploaded photo." }
  }

  const { data: current, error: profileError } = await identity.supabase
    .from("professional_profiles")
    .select("photo_path")
    .eq("user_id", identity.userId)
    .single()

  if (profileError) {
    return { ok: false, message: "We could not access your professional profile." }
  }

  const { error } = await identity.supabase
    .from("professional_profiles")
    .update({ photo_path: storagePath })
    .eq("user_id", identity.userId)

  if (error) return { ok: false, message: "We could not activate this photo." }

  if (current.photo_path && current.photo_path !== storagePath) {
    await identity.supabase.storage
      .from(professionalPhotosBucket)
      .remove([current.photo_path])
  }

  revalidatePath("/dashboard/profile")
  return { ok: true, message: "Professional photo updated." }
}

export async function removeProfessionalPhoto() {
  const identity = await requireIdentity("/dashboard/profile")
  const { data: current } = await identity.supabase
    .from("professional_profiles")
    .select("photo_path")
    .eq("user_id", identity.userId)
    .single()
  const { error } = await identity.supabase
    .from("professional_profiles")
    .update({ photo_path: null })
    .eq("user_id", identity.userId)
  if (error) redirect(messagePath("/dashboard/profile", "error", "We could not remove this photo."))
  if (current?.photo_path) {
    await identity.supabase.storage.from(professionalPhotosBucket).remove([current.photo_path])
  }
  revalidatePath("/dashboard/profile")
  redirect(messagePath("/dashboard/profile", "success", "Professional photo removed."))
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
