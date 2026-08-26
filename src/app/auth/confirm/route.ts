import type { EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

import { isSafeInternalPath } from "@/lib/auth/validation"
import { isAuthEnabled } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

function cleanNamePart(value: unknown) {
  if (typeof value !== "string") return ""

  return value.trim().replace(/\s+/g, " ").slice(0, 80)
}

function socialProfileName(metadata: Record<string, unknown>) {
  const firstName = cleanNamePart(
    metadata.given_name ?? metadata.first_name,
  )
  const lastName = cleanNamePart(
    metadata.family_name ?? metadata.last_name,
  )

  if (firstName || lastName) return { firstName, lastName }

  const fullName = cleanNamePart(metadata.full_name ?? metadata.name)
  const [fallbackFirstName = "", ...remainingNameParts] = fullName.split(" ")

  return {
    firstName: fallbackFirstName,
    lastName: remainingNameParts.join(" "),
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthEnabled()) {
    const unavailableUrl = new URL("/sign-in", request.url)
    unavailableUrl.searchParams.set(
      "error",
      "Authentication is not available for this deployment.",
    )
    return NextResponse.redirect(unavailableUrl)
  }

  const tokenHash = request.nextUrl.searchParams.get("token_hash")
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null
  const code = request.nextUrl.searchParams.get("code")
  const requestedAccountType = request.nextUrl.searchParams.get("account_type")
  const requestedNext = request.nextUrl.searchParams.get("next") ?? ""
  const next = isSafeInternalPath(requestedNext)
    ? requestedNext
    : "/onboarding"
  const supabase = await createClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (
        requestedAccountType === "professional" ||
        requestedAccountType === "employer"
      ) {
        const { error: accountTypeError } = await supabase.rpc(
          "set_initial_social_account_type",
          { target_account_type: requestedAccountType },
        )

        if (accountTypeError) {
          const errorUrl = new URL("/sign-in", request.url)
          errorUrl.searchParams.set(
            "error",
            "We could not finish setting up your account. Please try again.",
          )
          return NextResponse.redirect(errorUrl)
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { firstName, lastName } = socialProfileName(user.user_metadata)

        if (firstName || lastName) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", user.id)
            .maybeSingle()

          const profileUpdate = {
            ...(profile?.first_name?.trim() || !firstName
              ? {}
              : { first_name: firstName }),
            ...(profile?.last_name?.trim() || !lastName
              ? {}
              : { last_name: lastName }),
          }

          if (Object.keys(profileUpdate).length) {
            await supabase
              .from("profiles")
              .update(profileUpdate)
              .eq("id", user.id)
          }
        }
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  const errorUrl = new URL("/sign-in", request.url)
  errorUrl.searchParams.set(
    "error",
    "The confirmation link is invalid or has expired.",
  )
  return NextResponse.redirect(errorUrl)
}
