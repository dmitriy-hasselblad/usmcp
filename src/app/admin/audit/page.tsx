import type { Metadata } from "next"
import { History, Search } from "lucide-react"

import { AdminDirectoryPagination } from "@/components/admin/admin-directory-pagination"
import { AdminShell } from "@/components/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ADMIN_DIRECTORY_PAGE_SIZE,
  formatAdminDate,
  normalizeAdminQuery,
  parseAdminPage,
} from "@/lib/admin/directory"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = {
  title: "Audit Log | Platform administration",
  description: "Privileged USHCE moderation and administration audit events.",
}

const actions = [
  "organization.verification_status_changed",
  "job.moderation_status_changed",
  "user.account_status_changed",
  "organization_post.moderation_status_changed",
] as const

const targetTypes = ["organization", "job", "user", "organization_post"] as const

type AuditPageProps = {
  searchParams: Promise<{
    action?: string
    from?: string
    page?: string
    q?: string
    target?: string
    to?: string
  }>
}

type AuditEvent = {
  action: string
  actor_user_id: string
  created_at: string
  id: string
  metadata: Record<string, unknown>
  target_id: string | null
  target_type: string
}

export default async function AdminAuditPage({ searchParams }: AuditPageProps) {
  const [identity, params] = await Promise.all([
    requirePlatformAdmin("/admin/audit"),
    searchParams,
  ])
  const page = parseAdminPage(params.page)
  const query = normalizeAdminQuery(params.q)
  const action = actions.includes(params.action as (typeof actions)[number])
    ? params.action
    : undefined
  const target = targetTypes.includes(params.target as (typeof targetTypes)[number])
    ? params.target
    : undefined
  const fromDate = parseDate(params.from)
  const toDate = parseDate(params.to)
  const from = (page - 1) * ADMIN_DIRECTORY_PAGE_SIZE

  let auditQuery = identity.supabase
    .from("admin_audit_events")
    .select("id, actor_user_id, action, target_type, target_id, metadata, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_DIRECTORY_PAGE_SIZE - 1)

  if (query) auditQuery = auditQuery.or(`action.ilike.%${query}%,target_type.ilike.%${query}%`)
  if (action) auditQuery = auditQuery.eq("action", action)
  if (target) auditQuery = auditQuery.eq("target_type", target)
  if (fromDate) auditQuery = auditQuery.gte("created_at", fromDate.toISOString())
  if (toDate) auditQuery = auditQuery.lt("created_at", nextDay(toDate).toISOString())

  const { data, count, error } = await auditQuery
  const events = (data ?? []) as AuditEvent[]
  const actorIds = [...new Set(events.map((event) => event.actor_user_id))]
  const { data: actors } = actorIds.length
    ? await identity.supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", actorIds)
    : { data: [] }
  const actorNames = new Map(
    actors?.map((actor) => [
      actor.id,
      [actor.first_name, actor.last_name].filter(Boolean).join(" ") || "Platform administrator",
    ]),
  )

  return (
    <AdminShell active="audit" email={identity.email}>
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
          <History className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
            Platform administration
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
            Audit log
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Review privileged moderation and verification decisions. This log is
            read-only and available only to active platform administrators.
          </p>
        </div>
      </div>

      <form action="/admin/audit" className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_11rem_10rem_10rem_auto]" method="get">
        <Input aria-label="Search audit log" defaultValue={query} name="q" placeholder="Search action or target type" />
        <select className={selectClassName} defaultValue={action ?? ""} name="action">
          <option value="">All actions</option>
          {actions.map((value) => <option key={value} value={value}>{formatEventLabel(value)}</option>)}
        </select>
        <select className={selectClassName} defaultValue={target ?? ""} name="target">
          <option value="">All targets</option>
          {targetTypes.map((value) => <option key={value} value={value}>{formatTargetType(value)}</option>)}
        </select>
        <Input aria-label="Audit events from date" defaultValue={fromDate ? formatDateInput(fromDate) : ""} name="from" type="date" />
        <Input aria-label="Audit events to date" defaultValue={toDate ? formatDateInput(toDate) : ""} name="to" type="date" />
        <Button type="submit" variant="outline"><Search /> Search</Button>
      </form>

      <Card className="mt-6 bg-white">
        <CardContent className="p-0">
          {error ? (
            <Message title="Audit events could not be loaded" description="Refresh the page. If the issue continues, review the platform-admin access boundary." />
          ) : events.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[65rem] text-left text-sm">
                <thead className="border-b border-border bg-muted/35 text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold sm:px-6">When</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                    <th className="px-5 py-3 font-semibold">Target</th>
                    <th className="px-5 py-3 font-semibold">Administrator</th>
                    <th className="px-5 py-3 font-semibold sm:px-6">Decision details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-5 py-4 text-muted-foreground sm:px-6">{formatAdminDate(event.created_at)}</td>
                      <td className="px-5 py-4"><Badge variant="secondary">{formatEventLabel(event.action)}</Badge></td>
                      <td className="px-5 py-4"><p className="font-medium">{formatTargetType(event.target_type)}</p>{event.target_id && <p className="mt-1 font-mono text-xs text-muted-foreground">{event.target_id}</p>}</td>
                      <td className="px-5 py-4">{actorNames.get(event.actor_user_id) ?? "Platform administrator"}</td>
                      <td className="px-5 py-4 text-muted-foreground sm:px-6"><EventMetadata metadata={event.metadata} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Message title="No audit events match these filters" description="Try a broader date range or remove one of the filters." />
          )}
          {!error && <AdminDirectoryPagination basePath="/admin/audit" page={page} pageSize={ADMIN_DIRECTORY_PAGE_SIZE} params={{ action, from: fromDate ? formatDateInput(fromDate) : undefined, target, to: toDate ? formatDateInput(toDate) : undefined }} query={query} total={count ?? 0} />}
        </CardContent>
      </Card>
    </AdminShell>
  )
}

function EventMetadata({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata).filter(([, value]) => value !== null && value !== undefined && value !== "")
  if (!entries.length) return <span>—</span>
  return <dl className="grid gap-1">{entries.map(([key, value]) => <div className="flex gap-1.5" key={key}><dt className="font-medium text-foreground">{formatMetadataKey(key)}:</dt><dd className="break-all">{typeof value === "string" ? value : JSON.stringify(value)}</dd></div>)}</dl>
}

function parseDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function nextDay(value: Date) { return new Date(value.getTime() + 86_400_000) }
function formatDateInput(value: Date) { return value.toISOString().slice(0, 10) }
function formatTargetType(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function formatEventLabel(value: string) { return value.replaceAll("_", " ").replaceAll(".", " · ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function formatMetadataKey(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }
function Message({ description, title }: { description: string; title: string }) { return <div className="px-6 py-12 text-center"><h2 className="font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p></div> }

const selectClassName = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
