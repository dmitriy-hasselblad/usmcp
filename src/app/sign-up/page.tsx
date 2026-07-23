import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AccessPreviewCard } from "@/components/auth/access-preview-card"
import { UshceLogo } from "@/components/brand/ushce-logo"

export const metadata: Metadata = {
  title: "Create an Account",
  description: "USHCE account registration product preview.",
}

export default function SignUpPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[linear-gradient(135deg,#f8fcff_0%,#edf8f6_50%,#f6fbff_100%)] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-between">
          <Link aria-label="USHCE home" href="/">
            <UshceLogo />
          </Link>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            href="/"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>
        <AccessPreviewCard mode="sign-up" />
      </div>
    </main>
  )
}
