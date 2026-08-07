import Link from "next/link"
import type { ReactNode } from "react"
import { BriefcaseBusiness, Building2, History, LayoutDashboard, Newspaper, ShieldCheck, UsersRound } from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AdminRoute = "overview" | "users" | "organizations" | "jobs" | "news" | "audit"

const routes = [
  { key: "overview", href: "/admin", label: "Overview", icon: LayoutDashboard },
  { key: "users", href: "/admin/users", label: "Users", icon: UsersRound },
  {
    key: "organizations",
    href: "/admin/organizations",
    label: "Organizations",
    icon: Building2,
  },
  { key: "jobs", href: "/admin/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { key: "news", href: "/admin/news", label: "News", icon: Newspaper },
  { key: "audit", href: "/admin/audit", label: "Audit log", icon: History },
] as const

export function AdminShell({
  active = "overview",
  children,
  email,
}: {
  active?: AdminRoute
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
          <nav aria-label="Platform administration" className="flex gap-1.5 overflow-x-auto lg:grid">
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

