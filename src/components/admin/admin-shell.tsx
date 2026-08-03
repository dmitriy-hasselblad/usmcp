import Link from "next/link"
import type { ReactNode } from "react"
import { LayoutDashboard, ShieldCheck } from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AdminShell({
  children,
  email,
}: {
  children: ReactNode
  email?: string
}) {
  return (
    <div className="min-h-dvh bg-muted/35">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between px-5 lg:px-8">
          <Link aria-label="USHCE home" href="/">
            <UshceLogo />
          </Link>
          <div className="flex items-center gap-3">
            {email && (
              <p className="hidden max-w-60 truncate text-sm text-muted-foreground sm:block">
                {email}
              </p>
            )}
            <form action="/auth/sign-out" method="post">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-[15.5rem_1fr]">
        <aside className="border-b border-border bg-white px-4 py-4 lg:min-h-[calc(100dvh-4.5rem)] lg:border-r lg:border-b-0 lg:px-5 lg:py-7">
          <Badge className="mb-5 hidden bg-violet-100 text-violet-800 lg:inline-flex" variant="secondary">
            Platform administration
          </Badge>
          <nav aria-label="Platform administration">
            <Link
              className="flex h-10 items-center gap-2.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
              href="/admin"
            >
              <LayoutDashboard className="size-4" />
              Overview
            </Link>
          </nav>
          <div className="mt-7 hidden border-t border-border pt-5 lg:block">
            <div className="flex items-start gap-2.5 px-3 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Privileged access is separated from organization roles.
            </div>
          </div>
        </aside>
        <main className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}

