import type { Metadata } from "next"

import { moderateOrganizationPost } from "./actions"
import { AdminShell } from "@/components/admin/admin-shell"
import { AuthNotice } from "@/components/auth/auth-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = { title: "News oversight" }

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; success?: string | string[] }>
}) {
  const [identity, params] = await Promise.all([
    requirePlatformAdmin("/admin/news"),
    searchParams,
  ])
  const { data: posts } = await identity.supabase
    .from("organization_posts")
    .select("id, title, excerpt, body, status, moderation_status, moderation_reason, created_at, organizations(name)")
    .in("moderation_status", ["approved", "blocked"])
    .order("created_at", { ascending: false })
    .limit(100)
  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value

  return (
    <AdminShell active="news" email={identity.email}>
      <h1 className="text-4xl font-semibold tracking-[-0.05em]">News oversight</h1>
      <p className="mt-3 text-muted-foreground">
        Articles publish automatically. Use this area only to react to reports,
        block harmful content, or restore a blocked article.
      </p>
      <div className="mt-6">
        <AuthNotice error={one(params.error)} success={one(params.success)} />
      </div>
      <div className="mt-6 grid gap-5">
        {posts?.length ? (
          posts.map((post) => {
            const isBlocked = post.moderation_status === "blocked"
            return (
              <Card className="bg-white" key={post.id}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {post.organizations?.[0]?.name ?? "Organization"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {post.moderation_status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {post.status}
                    </Badge>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">{post.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold">
                      Read full article
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                      {post.body}
                    </p>
                  </details>
                  <div className="mt-5 max-w-xl">
                    {isBlocked ? (
                      <ModerationForm id={post.id} status="approved" label="Restore public visibility" />
                    ) : (
                      <ModerationForm id={post.id} status="blocked" label="Block from public news" />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            No published or blocked articles are available for review.
          </p>
        )}
      </div>
    </AdminShell>
  )
}

function ModerationForm({
  id,
  status,
  label,
}: {
  id: string
  status: "approved" | "blocked"
  label: string
}) {
  const isBlocking = status === "blocked"
  return (
    <form action={moderateOrganizationPost} className="grid gap-2">
      <input name="postId" type="hidden" value={id} />
      <input name="status" type="hidden" value={status} />
      <Textarea
        minLength={isBlocking ? 10 : undefined}
        name="reason"
        placeholder={isBlocking ? "Required reason for blocking" : "Optional restoration note"}
      />
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input name="confirmed" required type="checkbox" />
        I confirm this oversight decision.
      </label>
      <Button variant={isBlocking ? "destructive" : "default"}>{label}</Button>
    </form>
  )
}
