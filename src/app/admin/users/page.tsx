import type { Metadata } from "next"
import { Search, UsersRound } from "lucide-react"

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
  title: "Users | Platform administration",
  description: "Read-only USHCE user directory for platform administrators.",
}

type UsersPageProps = {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const [identity, params] = await Promise.all([
    requirePlatformAdmin("/admin/users"),
    searchParams,
  ])
  const page = parseAdminPage(params.page)
  const query = normalizeAdminQuery(params.q)
  const from = (page - 1) * ADMIN_DIRECTORY_PAGE_SIZE
  const to = from + ADMIN_DIRECTORY_PAGE_SIZE - 1

  let usersQuery = identity.supabase
    .from("profiles")
    .select(
      "id, account_type, first_name, last_name, onboarding_completed, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (query) {
    usersQuery = usersQuery.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%`,
    )
  }

  const { data: users, count, error } = await usersQuery

  return (
    <AdminShell active="users" email={identity.email}>
      <DirectoryHeader
        description="Review account type, onboarding state, and registration date. Authentication credentials are intentionally excluded."
        icon={UsersRound}
        title="Users"
      />

      <SearchForm action="/admin/users" query={query} />

      <Card className="mt-6 bg-white">
        <CardContent className="p-0">
          {error ? (
            <DirectoryMessage
              title="Users could not be loaded"
              description="Refresh the page. If the issue continues, review the admin access policy and Supabase logs."
            />
          ) : users?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="border-b border-border bg-muted/35 text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold sm:px-6">User</th>
                    <th className="px-5 py-3 font-semibold">Account</th>
                    <th className="px-5 py-3 font-semibold">Onboarding</th>
                    <th className="px-5 py-3 font-semibold sm:px-6">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-semibold">
                          {[user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed user"}
                        </p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{user.id}</p>
                      </td>
                      <td className="px-5 py-4 capitalize">{user.account_type}</td>
                      <td className="px-5 py-4">
                        <Badge variant={user.onboarding_completed ? "secondary" : "outline"}>
                          {user.onboarding_completed ? "Completed" : "Incomplete"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground sm:px-6">
                        {formatAdminDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DirectoryMessage
              title={query ? "No matching users" : "No users yet"}
              description={query ? "Try a different first or last name." : "Registered users will appear here."}
            />
          )}
          {!error && (
            <AdminDirectoryPagination
              basePath="/admin/users"
              page={page}
              pageSize={ADMIN_DIRECTORY_PAGE_SIZE}
              query={query}
              total={count ?? 0}
            />
          )}
        </CardContent>
      </Card>
    </AdminShell>
  )
}

function DirectoryHeader({ description, icon: Icon, title }: { description: string; icon: typeof UsersRound; title: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Platform administration</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{title}</h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function SearchForm({ action, query }: { action: string; query: string }) {
  return (
    <form action={action} className="mt-8 flex max-w-xl gap-2" method="get">
      <Input aria-label="Search users by name" defaultValue={query} name="q" placeholder="Search by first or last name" />
      <Button type="submit" variant="outline"><Search /> Search</Button>
    </form>
  )
}

function DirectoryMessage({ description, title }: { description: string; title: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}
