import Link from "next/link"
import { Bell, Check, CheckCheck, ChevronRight } from "lucide-react"

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/dashboard/notifications/actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireIdentity } from "@/lib/auth/session"
import { requireEmployerWorkspace } from "@/lib/employer/session"

type NotificationRecord = {
  id: string
  title: string
  body: string
  href: string
  read_at: string | null
  created_at: string
}

type Props = {
  searchParams: Promise<{ error?: string | string[]; success?: string | string[] }>
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export const metadata = {
  title: "Notifications",
  description: "Private USHCE application updates.",
}

export default async function NotificationsPage({ searchParams }: Props) {
  const [identity, query] = await Promise.all([
    requireIdentity("/dashboard/notifications"),
    searchParams,
  ])
  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .maybeSingle()

  if (profile?.account_type === "employer") {
    return <EmployerNotifications query={query} />
  }

  const notifications = await getNotifications(identity.userId, identity.supabase)
  return (
    <ProfessionalDashboardShell active="notifications" email={identity.email}>
      <NotificationsContent notifications={notifications} query={query} />
    </ProfessionalDashboardShell>
  )
}

async function EmployerNotifications({ query }: { query: Awaited<Props["searchParams"]> }) {
  const workspace = await requireEmployerWorkspace("/dashboard/notifications")
  const notifications = await getNotifications(workspace.userId, workspace.supabase)
  return (
    <EmployerDashboardShell
      active="notifications"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <NotificationsContent notifications={notifications} query={query} />
    </EmployerDashboardShell>
  )
}

async function getNotifications(
  userId: string,
  supabase: Awaited<ReturnType<typeof requireIdentity>>["supabase"],
) {
  const { data } = await supabase
    .from("user_notifications")
    .select("id, title, body, href, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100)

  return (data ?? []) as NotificationRecord[]
}

function NotificationsContent({
  notifications,
  query,
}: {
  notifications: NotificationRecord[]
  query: Awaited<Props["searchParams"]>
}) {
  const unreadCount = notifications.filter((notification) => !notification.read_at).length

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline">Private updates</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Notifications {unreadCount > 0 && <span className="ml-2 inline-grid min-w-7 place-items-center rounded-full bg-red-600 px-2 py-0.5 align-middle text-sm tracking-normal text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Application updates appear here. Unread updates are marked in red.
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline">
              <CheckCheck /> Mark all as read
            </Button>
          </form>
        )}
      </div>

      <div className="mt-6">
        <AuthNotice error={one(query.error)} success={one(query.success)} />
      </div>

      {notifications.length ? (
        <div className="mt-7 grid gap-3">
          {notifications.map((notification) => (
            <Card
              className={notification.read_at ? "bg-white" : "border-primary/30 bg-primary/3"}
              key={notification.id}
            >
              <CardContent className="flex gap-4 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                  <Bell className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link className="font-semibold hover:text-primary hover:underline" href={notification.href}>
                      {notification.title}
                    </Link>
                    {!notification.read_at && <Badge className="bg-primary" variant="secondary">New</Badge>}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{notification.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  {!notification.read_at && (
                    <form action={markNotificationRead}>
                      <input name="notificationId" type="hidden" value={notification.id} />
                      <Button aria-label="Mark as read" size="icon" type="submit" variant="ghost">
                        <Check className="size-4" />
                      </Button>
                    </form>
                  )}
                  <Button asChild aria-label="Open notification" size="icon" variant="ghost">
                    <Link href={notification.href}><ChevronRight className="size-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-7 bg-white">
          <CardContent className="p-8 text-center">
            <Bell className="mx-auto size-6 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">You are all caught up.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              New application and hiring-status updates will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}
