import Link from "next/link"
import type { ReactNode } from "react"
import {
  Building2,
  BriefcaseBusiness,
  LayoutDashboard,
  LockKeyhole,
  UsersRound,
} from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmployerRoute = "overview" | "jobs" | "organization"

const routes = [
  {
    key: "overview",
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "jobs",
    href: "/dashboard/jobs",
    label: "Jobs",
    icon: BriefcaseBusiness,
  },
  {
    key: "organization",
    href: "/dashboard/organization",
    label: "Organization",
    icon: Building2,
  },
] as const

export function EmployerDashboardShell({
  active,
  children,
  email,
  organizationName,
}: {
  active: EmployerRoute
  children: ReactNode
  email?: string
  organizationName: string
}) {
  return (
    <div className="min-h-dvh bg-muted/35">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between px-5 lg:px-8">
          <Link aria-label="USHCE home" href="/">
            <UshceLogo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-52 truncate text-sm font-semibold">
                {organizationName}
              </p>
              {email && (
                <p className="max-w-52 truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
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
          <div className="mb-5 hidden px-2 lg:block">
            <Badge className="bg-teal-100 text-teal-800" variant="secondary">
              Employer workspace
            </Badge>
          </div>
          <nav aria-label="Employer workspace" className="flex gap-1.5 overflow-x-auto lg:grid">
            {routes.map((route) => {
              const Icon = route.icon
              return (
                <Link
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                    active === route.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  href={route.href}
                  key={route.key}
                >
                  <Icon className="size-4" />
                  {route.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-7 hidden border-t border-border pt-5 lg:block">
            <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Coming next
            </p>
            <div className="mt-2 grid gap-1">
              <SoonItem icon={UsersRound} label="Candidates" />
              <SoonItem icon={LockKeyhole} label="Team & access" />
            </div>
          </div>
        </aside>
        <main className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}

function SoonItem({
  icon: Icon,
  label,
}: {
  icon: typeof UsersRound
  label: string
}) {
  return (
    <div className="flex h-10 items-center gap-2.5 px-3 text-sm text-muted-foreground/70">
      <Icon className="size-4" />
      <span>{label}</span>
      <span className="ml-auto text-[0.65rem] font-semibold tracking-wide uppercase">
        Soon
      </span>
    </div>
  )
}
