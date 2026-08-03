import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ExternalLink, Search } from "lucide-react"

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
  title: "Organizations | Platform administration",
  description: "Read-only USHCE organization directory for platform administrators.",
}

type OrganizationsPageProps = {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>
}

export default async function AdminOrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const [identity, params] = await Promise.all([
    requirePlatformAdmin("/admin/organizations"),
    searchParams,
  ])
  const page = parseAdminPage(params.page)
  const query = normalizeAdminQuery(params.q)
  const pendingOnly = params.status === "pending"
  const from = (page - 1) * ADMIN_DIRECTORY_PAGE_SIZE
  const to = from + ADMIN_DIRECTORY_PAGE_SIZE - 1

  let organizationsQuery = identity.supabase
    .from("organizations")
    .select(
      "id, name, slug, organization_type, state_code, verification_status, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (query) organizationsQuery = organizationsQuery.ilike("name", `%${query}%`)
  if (pendingOnly) organizationsQuery = organizationsQuery.eq("verification_status", "pending")

  const { data: organizations, count, error } = await organizationsQuery

  return (
    <AdminShell active="organizations" email={identity.email}>
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
          <Building2 className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Platform administration</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">Organizations</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            Review organization identity and verification state. Every moderation decision is protected by the platform-admin boundary and audit log.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant={pendingOnly ? "outline" : "default"}>
          <Link href="/admin/organizations">All organizations</Link>
        </Button>
        <Button asChild size="sm" variant={pendingOnly ? "default" : "outline"}>
          <Link href="/admin/organizations?status=pending">Pending verification</Link>
        </Button>
      </div>

      <form action="/admin/organizations" className="mt-4 flex max-w-xl gap-2" method="get">
        {pendingOnly && <input name="status" type="hidden" value="pending" />}
        <Input aria-label="Search organizations by name" defaultValue={query} name="q" placeholder="Search by organization name" />
        <Button type="submit" variant="outline"><Search /> Search</Button>
      </form>

      <Card className="mt-6 bg-white">
        <CardContent className="p-0">
          {error ? (
            <DirectoryMessage title="Organizations could not be loaded" description="Refresh the page. If the issue continues, review the admin access policy and Supabase logs." />
          ) : organizations?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="border-b border-border bg-muted/35 text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold sm:px-6">Organization</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">State</th>
                    <th className="px-5 py-3 font-semibold">Verification</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 font-semibold sm:px-6"><span className="sr-only">Review organization</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {organizations.map((organization) => (
                    <tr key={organization.id}>
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-semibold">{organization.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">/{organization.slug}</p>
                      </td>
                      <td className="px-5 py-4">{organization.organization_type}</td>
                      <td className="px-5 py-4">{organization.state_code}</td>
                      <td className="px-5 py-4"><VerificationBadge status={organization.verification_status} /></td>
                      <td className="px-5 py-4 text-muted-foreground">{formatAdminDate(organization.created_at)}</td>
                      <td className="px-5 py-4 text-right sm:px-6">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/organizations/${organization.id}`}>Review <ExternalLink /></Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DirectoryMessage
              title={query ? "No matching organizations" : "No organizations yet"}
              description={query ? "Try a different organization name." : "Employer organizations will appear here."}
            />
          )}
          {!error && (
            <AdminDirectoryPagination
              basePath="/admin/organizations"
              page={page}
              pageSize={ADMIN_DIRECTORY_PAGE_SIZE}
              query={query}
              status={pendingOnly ? "pending" : undefined}
              total={count ?? 0}
            />
          )}
        </CardContent>
      </Card>
    </AdminShell>
  )
}

function VerificationBadge({ status }: { status: string }) {
  const className = status === "verified"
    ? "bg-emerald-100 text-emerald-800"
    : status === "pending"
      ? "bg-amber-100 text-amber-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-700"
  return <Badge className={className} variant="secondary">{status}</Badge>
}

function DirectoryMessage({ description, title }: { description: string; title: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}
