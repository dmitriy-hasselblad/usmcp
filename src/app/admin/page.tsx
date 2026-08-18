import type { Metadata } from "next"
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { Card, CardContent } from "@/components/ui/card"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = {
  title: "Platform administration",
  description: "Secure SM VIA platform administration workspace.",
}

export default async function AdminOverviewPage() {
  const identity = await requirePlatformAdmin()
  const [
    { count: users },
    { count: organizations },
    { count: pendingOrganizations },
    { count: jobs },
    { count: applications },
  ] = await Promise.all([
    identity.supabase.from("profiles").select("id", { count: "exact", head: true }),
    identity.supabase.from("organizations").select("id", { count: "exact", head: true }),
    identity.supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "pending"),
    identity.supabase.from("jobs").select("id", { count: "exact", head: true }),
    identity.supabase.from("applications").select("id", { count: "exact", head: true }),
  ])

  return (
    <AdminShell email={identity.email}>
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            Restricted workspace
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            Platform overview
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Review marketplace activity from a workspace available only to active platform administrators.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={UsersRound} label="Users" value={users ?? 0} />
        <Metric icon={Building2} label="Organizations" value={organizations ?? 0} />
        <Metric icon={ShieldCheck} label="Awaiting verification" value={pendingOrganizations ?? 0} />
        <Metric icon={BriefcaseBusiness} label="Jobs" value={jobs ?? 0} />
        <Metric icon={FileText} label="Applications" value={applications ?? 0} />
      </div>

      <Card className="mt-8 bg-white">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold tracking-[-0.03em]">Authorization foundation ready</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Platform access is independent from employer organization roles. Future verification and moderation actions must use controlled database operations that write an audit event with the actor, target, action, and timestamp.
          </p>
        </CardContent>
      </Card>
    </AdminShell>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound
  label: string
  value: number
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-5">
        <Icon className="size-5 text-primary" />
        <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
