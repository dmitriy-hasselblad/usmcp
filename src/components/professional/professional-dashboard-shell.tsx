import Link from "next/link"
import type { ReactNode } from "react"
import { BriefcaseBusiness, FileText, LayoutDashboard } from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProfessionalRoute = "overview" | "applications"

const routes = [
  {
    key: "overview",
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "applications",
    href: "/dashboard/applications",
    label: "My applications",
    icon: FileText,
  },
  {
    key: "jobs",
    href: "/jobs",
    label: "Find jobs",
    icon: BriefcaseBusiness,
  },
] as const

export function ProfessionalDashboardShell({
  active,
  children,
  email,
}: {
  active: ProfessionalRoute
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
              <span className="hidden max-w-64 truncate text-sm text-muted-foreground sm:inline">
                {email}
              </span>
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
          <div className="mb-5 hidden px-2 lg:block">
            <Badge className="bg-blue-50 text-primary" variant="secondary">
              Professional workspace
            </Badge>
          </div>
          <nav
            aria-label="Professional workspace"
            className="flex gap-1.5 overflow-x-auto lg:grid"
          >
            {routes.map((route) => {
              const Icon = route.icon
              const isActive =
                route.key === "jobs" ? false : active === route.key

              return (
                <Link
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                    isActive
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
        </aside>
        <main className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
