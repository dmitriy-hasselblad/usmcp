"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  careerStages,
  formString,
  isAccountType,
  isSafeInternalPath,
  isUsState,
  isValidEmail,
  messagePath,
  organizationTypes,
  professions,
} from "@/lib/auth/validation"
import { getSiteUrl, isAuthEnabled } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

const configurationError =
  "Authentication is not configured for this deployment yet."

export async function signIn(formData: FormData) {
  if (!isAuthEnabled()) {
    redirect(messagePath("/sign-in", "error", configurationError))
  }

  const email = formString(formData, "email").toLowerCase()
  const password = formString(formData, "password")
  const requestedNext = formString(formData, "next")

  if (!isValidEmail(email) || !password) {
    redirect(
      messagePath(
        "/sign-in",
        "error",
        "Enter a valid email address and password.",
      ),
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(
      messagePath(
        "/sign-in",
        "error",
        "We could not sign you in. Check your email and password.",
      ),
    )
  }

  revalidatePath("/", "layout")

  if (requestedNext && isSafeInternalPath(requestedNext)) {
    redirect(requestedNext)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .maybeSingle()

  redirect(profile?.onboarding_completed ? "/dashboard" : "/onboarding")
}

export async function signUp(formData: FormData) {
  if (!isAuthEnabled()) {
    redirect(messagePath("/sign-up", "error", configurationError))
  }

  const accountType = formString(formData, "accountType")
  const email = formString(formData, "email").toLowerCase()
  const password = formString(formData, "password")
  const confirmPassword = formString(formData, "confirmPassword")

  if (!isAccountType(accountType)) {
    redirect(
      messagePath("/sign-up", "error", "Choose an account type to continue."),
    )
  }

  if (!isValidEmail(email)) {
    redirect(
      messagePath("/sign-up", "error", "Enter a valid email address."),
    )
  }

  if (password.length < 8 || password.length > 72) {
    redirect(
      messagePath(
        "/sign-up",
        "error",
        "Use a password between 8 and 72 characters.",
      ),
    )
  }

  if (password !== confirmPassword) {
    redirect(
      messagePath("/sign-up", "error", "The passwords do not match."),
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { account_type: accountType },
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`,
    },
  })

  if (error) {
    redirect(
      messagePath(
        "/sign-up",
        "error",
        "We could not create the account. Please try again.",
      ),
    )
  }

  revalidatePath("/", "layout")

  if (data.session) {
    redirect("/onboarding")
  }

  redirect(
    messagePath(
      "/sign-in",
      "success",
      "Check your email and confirm your address to finish creating your account.",
    ),
  )
}

export async function requestPasswordReset(formData: FormData) {
  if (!isAuthEnabled()) {
    redirect(messagePath("/forgot-password", "error", configurationError))
  }

  const email = formString(formData, "email").toLowerCase()

  if (!isValidEmail(email)) {
    redirect(
      messagePath("/forgot-password", "error", "Enter a valid email address."),
    )
  }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/update-password`,
  })

  redirect(
    messagePath(
      "/forgot-password",
      "success",
      "If an account exists for that email, a reset link is on its way.",
    ),
  )
}

export async function updatePassword(formData: FormData) {
  if (!isAuthEnabled()) {
    redirect(messagePath("/update-password", "error", configurationError))
  }

  const password = formString(formData, "password")
  const confirmPassword = formString(formData, "confirmPassword")

  if (password.length < 8 || password.length > 72) {
    redirect(
      messagePath(
        "/update-password",
        "error",
        "Use a password between 8 and 72 characters.",
      ),
    )
  }

  if (password !== confirmPassword) {
    redirect(
      messagePath("/update-password", "error", "The passwords do not match."),
    )
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()

  if (!claimsData?.claims?.sub) {
    redirect(
      messagePath(
        "/forgot-password",
        "error",
        "The reset link is invalid or has expired. Request a new one.",
      ),
    )
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect(
      messagePath(
        "/update-password",
        "error",
        "We could not update the password. Request a new reset link.",
      ),
    )
  }

  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect(
    messagePath(
      "/sign-in",
      "success",
      "Your password was updated. You can sign in now.",
    ),
  )
}

export async function completeOnboarding(formData: FormData) {
  if (!isAuthEnabled()) {
    redirect(messagePath("/onboarding", "error", configurationError))
  }

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect("/sign-in?next=/onboarding")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    redirect(
      messagePath(
        "/onboarding",
        "error",
        "Your account profile is not ready. Confirm that the database setup has been applied.",
      ),
    )
  }

  const firstName = formString(formData, "firstName")
  const lastName = formString(formData, "lastName")
  const stateCode = formString(formData, "stateCode")

  if (
    firstName.length < 2 ||
    firstName.length > 80 ||
    lastName.length < 2 ||
    lastName.length > 80
  ) {
    redirect(
      messagePath(
        "/onboarding",
        "error",
        "Enter your first and last name using 2 to 80 characters each.",
      ),
    )
  }

  if (!isUsState(stateCode)) {
    redirect(
      messagePath("/onboarding", "error", "Choose a valid U.S. state."),
    )
  }

  if (profile.account_type === "professional") {
    const profession = formString(formData, "profession")
    const specialty = formString(formData, "specialty")
    const careerStage = formString(formData, "careerStage")

    if (
      !professions.some((option) => option === profession) ||
      !careerStages.some((option) => option === careerStage) ||
      specialty.length > 120
    ) {
      redirect(
        messagePath(
          "/onboarding",
          "error",
          "Review the professional information and try again.",
        ),
      )
    }

    const professionalDetails = {
      profession,
      specialty: specialty || null,
      state_code: stateCode,
      career_stage: careerStage,
    }
    const { data: existingProfessionalProfile } = await supabase
      .from("professional_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()
    const { error } = existingProfessionalProfile
      ? await supabase
          .from("professional_profiles")
          .update(professionalDetails)
          .eq("user_id", userId)
      : await supabase.from("professional_profiles").insert({
          user_id: userId,
          ...professionalDetails,
        })

    if (error) {
      redirect(
        messagePath(
          "/onboarding",
          "error",
          "We could not save the professional profile.",
        ),
      )
    }
  } else if (profile.account_type === "employer") {
    const organizationName = formString(formData, "organizationName")
    const organizationType = formString(formData, "organizationType")
    const positionTitle = formString(formData, "positionTitle")

    if (
      organizationName.length < 2 ||
      organizationName.length > 160 ||
      !organizationTypes.some((option) => option === organizationType) ||
      positionTitle.length < 2 ||
      positionTitle.length > 120
    ) {
      redirect(
        messagePath(
          "/onboarding",
          "error",
          "Review the organization information and try again.",
        ),
      )
    }

    const employerDetails = {
      organization_name: organizationName,
      organization_type: organizationType,
      state_code: stateCode,
      position_title: positionTitle,
    }
    const { data: existingEmployerProfile } = await supabase
      .from("employer_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()
    const { error } = existingEmployerProfile
      ? await supabase
          .from("employer_profiles")
          .update(employerDetails)
          .eq("user_id", userId)
      : await supabase.from("employer_profiles").insert({
          user_id: userId,
          ...employerDetails,
        })

    if (error) {
      redirect(
        messagePath(
          "/onboarding",
          "error",
          "We could not save the employer profile.",
        ),
      )
    }
  } else {
    redirect(
      messagePath(
        "/onboarding",
        "error",
        "This account type is not supported.",
      ),
    )
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      onboarding_completed: true,
    })
    .eq("id", userId)

  if (updateError) {
    redirect(
      messagePath(
        "/onboarding",
        "error",
        "The profile details were saved, but onboarding could not be completed.",
      ),
    )
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
