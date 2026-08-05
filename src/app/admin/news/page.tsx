import type { Metadata } from "next"

import { moderateOrganizationPost } from "./actions"
import { AdminShell } from "@/components/admin/admin-shell"
import { AuthNotice } from "@/components/auth/auth-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { requirePlatformAdmin } from "@/lib/admin/session"

export const metadata: Metadata = { title: "News Moderation" }
export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ error?: string | string[]; success?: string | string[] }> }) {
  const [identity, params] = await Promise.all([requirePlatformAdmin("/admin/news"), searchParams])
  const { data: posts } = await identity.supabase.from("organization_posts").select("id, title, excerpt, body, status, moderation_status, moderation_reason, created_at, organizations(name)").neq("status", "draft").order("created_at", { ascending: false }).limit(100)
  const one = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v
  return <AdminShell active="news" email={identity.email}><h1 className="text-4xl font-semibold tracking-[-0.05em]">News moderation</h1><p className="mt-3 text-muted-foreground">Review organization-authored stories before public publication.</p><div className="mt-6"><AuthNotice error={one(params.error)} success={one(params.success)} /></div><div className="mt-6 grid gap-5">{posts?.length ? posts.map(post => <Card className="bg-white" key={post.id}><CardContent className="p-6"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{post.organizations?.[0]?.name ?? "Organization"}</Badge><Badge variant="outline" className="capitalize">{post.moderation_status}</Badge></div><h2 className="mt-4 text-xl font-semibold">{post.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p><details className="mt-4"><summary className="cursor-pointer text-sm font-semibold">Read full article</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{post.body}</p></details><div className="mt-5 grid gap-4 md:grid-cols-2"><ModerationForm id={post.id} status="approved" label="Approve and publish"/><ModerationForm id={post.id} status="blocked" label="Block publication"/></div></CardContent></Card>) : <p className="text-sm text-muted-foreground">No submitted articles.</p>}</div></AdminShell>
}
function ModerationForm({ id, status, label }: { id: string; status: "approved" | "blocked"; label: string }) { return <form action={moderateOrganizationPost} className="grid gap-2"><input type="hidden" name="postId" value={id}/><input type="hidden" name="status" value={status}/><Textarea name="reason" minLength={status === "blocked" ? 10 : undefined} placeholder={status === "blocked" ? "Required reason for blocking" : "Optional moderation note"}/><label className="flex items-center gap-2 text-xs text-muted-foreground"><input name="confirmed" type="checkbox" required/> I confirm this moderation decision.</label><Button variant={status === "blocked" ? "destructive" : "default"}>{label}</Button></form> }
