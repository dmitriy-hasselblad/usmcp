import type { Metadata } from "next"
import Link from "next/link"
import { Building2 } from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireIdentity } from "@/lib/auth/session"

export const metadata: Metadata = {
  title: "Workspace Setup Required",
}

export default async function WorkspaceUnavailablePage() {
  await requireIdentity("/dashboard/workspace-unavailable")

  return (
    <div className="min-h-dvh bg-muted/35">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-[4.5rem] max-w-5xl items-center px-5">
          <Link aria-label="USHCE home" href="/">
            <UshceLogo />
          </Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-2xl place-items-center px-5 py-20">
        <Card className="w-full bg-white">
          <CardContent className="p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <Building2 className="size-6" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              Organization workspace needs attention
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Your account is active, but its organization membership could not
              be loaded. Your account data has not been lost.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/dashboard">Try again</Link>
              </Button>
              <form action="/auth/sign-out" method="post">
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
