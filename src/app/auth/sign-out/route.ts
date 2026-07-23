import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/sign-in", request.url), {
      status: 303,
    })
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims?.sub) {
    await supabase.auth.signOut()
  }

  revalidatePath("/", "layout")
  return NextResponse.redirect(new URL("/sign-in", request.url), {
    status: 303,
  })
}
