import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { changeUserAccountStatus } from "@/app/admin/users/actions"
import { AdminShell } from "@/components/admin/admin-shell"
import { AuthNotice } from "@/components/auth/auth-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { formatAdminDate } from "@/lib/admin/directory"
import { requirePlatformAdmin } from "@/lib/admin/session"

export default async function AdminUserReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string | string[]; success?: string | string[] }> }) {
  const [identity, { id }, query] = await Promise.all([requirePlatformAdmin(), params, searchParams])
  const [{ data: user, error }, { data: moderation }, { data: platformAdmin }] = await Promise.all([
    identity.supabase.from("profiles").select("id, account_type, first_name, last_name, onboarding_completed, created_at").eq("id", id).maybeSingle(),
    identity.supabase.from("account_moderation").select("status, reason, moderated_at").eq("user_id", id).maybeSingle(),
    identity.supabase.from("platform_admins").select("user_id").eq("user_id", id).eq("is_active", true).maybeSingle(),
  ])
  if (error || !user) notFound()
  const status = moderation?.status ?? "active"
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed user"
  return <AdminShell active="users" email={identity.email}>
    <Button asChild size="sm" variant="ghost"><Link href="/admin/users"><ArrowLeft /> Back to users</Link></Button>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">User review</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{name}</h1><p className="mt-3 font-mono text-xs text-muted-foreground">{user.id}</p></div><Badge variant={status === "suspended" ? "destructive" : "secondary"}>{status}</Badge></div>
    <div className="mt-6"><AuthNotice error={first(query.error)} success={first(query.success)} /></div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_23rem]"><Card className="bg-white"><CardContent className="p-6"><h2 className="text-lg font-semibold">Account details</h2><dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2"><Detail label="Account type" value={user.account_type} /><Detail label="Onboarding" value={user.onboarding_completed ? "Completed" : "Incomplete"} /><Detail label="Registered" value={formatAdminDate(user.created_at)} /><Detail label="Platform administrator" value={platformAdmin ? "Yes" : "No"} />{moderation?.moderated_at && <Detail label="Last moderated" value={formatAdminDate(moderation.moderated_at)} />}</dl>{moderation?.reason && <div className="mt-6 border-t pt-5"><p className="text-sm text-muted-foreground">Latest moderation reason</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{moderation.reason}</p></div>}</CardContent></Card>
    <Card className="h-fit bg-white"><CardContent className="p-6"><ShieldCheck className="size-6 text-violet-700" /><h2 className="mt-4 text-lg font-semibold">Account access</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Suspension blocks protected app data and files without deleting the Auth user. Every decision is recorded.</p>{platformAdmin ? <p className="mt-6 rounded-lg bg-muted p-4 text-sm">Active platform administrators cannot be suspended.</p> : user.id === identity.userId ? <p className="mt-6 rounded-lg bg-muted p-4 text-sm">You cannot moderate your own account.</p> : <div className="mt-6"><StatusForm id={user.id} status={status === "active" ? "suspended" : "active"} /></div>}</CardContent></Card></div>
  </AdminShell>
}

function StatusForm({ id, status }: { id: string; status: "active" | "suspended" }) { const suspending = status === "suspended"; return <form action={changeUserAccountStatus} className="rounded-xl border p-4"><input name="userId" type="hidden" value={id} /><input name="targetStatus" type="hidden" value={status} /><label className="grid gap-2 text-sm font-medium">Moderation reason {suspending ? "(required)" : "(optional)"}<Textarea maxLength={1000} minLength={suspending ? 10 : undefined} name="moderationReason" required={suspending} rows={4} /></label><label className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input className="mt-1 size-4" name="confirmed" required type="checkbox" />I confirm this account access decision and understand it will be recorded in the audit log.</label><Button className="mt-4 w-full" type="submit" variant={suspending ? "destructive" : "outline"}>{suspending ? "Suspend account" : "Reactivate account"}</Button></form> }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold capitalize">{value}</dd></div> }
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value }
