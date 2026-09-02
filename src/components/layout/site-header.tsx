import Link from "next/link"
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, UserRound } from "lucide-react"

import { SmviaLogo } from "@/components/brand/smvia-logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { isAuthEnabled } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

const navigation = [
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Organizations" },
  { href: "/news", label: "News & insights" },
  { href: "/resources", label: "Career resources" },
  { href: "/career-paths", label: "Career paths" },
  { href: "/for-employers", label: "For employers" },
]

async function getHeaderIdentity() {
  if (!isAuthEnabled()) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (error || !claims?.sub) {
    return null
  }

  const { data: notifications } = await supabase
    .from("user_notifications")
    .select("id, title, body, href")
    .eq("user_id", claims.sub)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(4)

  return {
    email: typeof claims.email === "string" ? claims.email : undefined,
    notifications: notifications ?? [],
  }
}

export async function SiteHeader() {
  const identity = await getHeaderIdentity()

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="SM VIA home">
          <SmviaLogo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              className="rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {identity ? (
            <>
              <Button asChild className="h-10 rounded-xl px-4 shadow-sm">
                <Link href="/dashboard">
                  <LayoutDashboard />
                  My workspace
                </Link>
              </Button>
              <NotificationMenu notifications={identity.notifications} />
              <AccountMenu email={identity.email} />
            </>
          ) : (
            <>
              <Button asChild className="h-10 px-4" variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="h-10 rounded-xl px-4 shadow-sm">
                <Link href="/sign-up">Create an account</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              aria-label="Open navigation menu"
              className="lg:hidden"
              size="icon"
              variant="ghost"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[min(22rem,90vw)] p-0" side="right">
            <SheetHeader className="border-b border-border px-6 py-5">
              <SheetTitle className="text-left">
                <SmviaLogo />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation for the SM VIA website.
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 py-5" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-2 border-t border-border p-4">
              {identity ? (
                <>
                  <div className="mb-2 flex min-w-0 items-center gap-3 rounded-xl bg-muted p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <UserRound className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Signed in as
                      </p>
                      <p className="truncate text-sm font-semibold">
                        {identity.email ?? "SM VIA member"}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="h-11">
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      My workspace
                    </Link>
                  </Button>
                  <NotificationMenu notifications={identity.notifications} mobile />
                  <Button asChild className="h-11" variant="outline">
                    <Link href="/dashboard/profile">
                      <UserRound />
                      Profile
                    </Link>
                  </Button>
                  <Button asChild className="h-11" variant="outline">
                    <Link href="/dashboard/security">
                      <Settings />
                      Settings
                    </Link>
                  </Button>
                  <form action="/auth/sign-out" method="post">
                    <Button
                      className="h-11 w-full"
                      type="submit"
                      variant="outline"
                    >
                      <LogOut />
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild className="h-11" variant="outline">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button asChild className="h-11">
                    <Link href="/sign-up">Create an account</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

type HeaderNotification = {
  id: string
  title: string
  body: string
  href: string
}

function AccountMenu({ email }: { email?: string }) {
  const initial = email?.trim().charAt(0).toUpperCase() || "M"

  return (
    <details className="relative hidden lg:block">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-border bg-white px-2.5 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">
          {initial}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
        <span className="sr-only">Open account menu</span>
      </summary>
      <div className="absolute right-0 top-12 w-64 rounded-xl border border-border bg-white p-2 shadow-xl">
        <div className="border-b border-border px-3 py-3">
          <p className="text-sm font-semibold">Account</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {email ?? "SM VIA member"}
          </p>
        </div>
        <div className="grid gap-1 p-1.5">
          <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" href="/dashboard/profile">
            <UserRound className="size-4" />
            Profile
          </Link>
          <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" href="/dashboard/security">
            <Settings className="size-4" />
            Settings
          </Link>
          <form action="/auth/sign-out" method="post">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" type="submit">
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </details>
  )
}

function NotificationMenu({
  notifications,
  mobile = false,
}: {
  notifications: HeaderNotification[]
  mobile?: boolean
}) {
  const count = notifications.length

  return (
    <details className={mobile ? "relative" : "relative hidden lg:block"}>
      <summary className="relative flex h-10 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-white px-3 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <Bell className={count ? "size-4 text-red-600" : "size-4"} />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-5 text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </summary>
      <div className={mobile ? "mt-2 w-full rounded-xl border border-border bg-white p-3 shadow-xl" : "absolute right-0 top-12 w-80 rounded-xl border border-border bg-white p-3 shadow-xl"}>
        <p className="px-2 text-sm font-semibold">
          {count ? `You have ${count} notification${count === 1 ? "" : "s"}.` : "You are all caught up."}
        </p>
        {count > 0 && (
          <div className="mt-2 grid divide-y">
            {notifications.slice(0, 3).map((notification) => (
              <Link className="rounded-lg px-2 py-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" href={notification.href} key={notification.id}>
                <span className="block font-medium">{notification.title}</span>
                <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">{notification.body}</span>
              </Link>
            ))}
          </div>
        )}
        <Link className="mt-2 block rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" href="/dashboard/notifications">View all notifications</Link>
      </div>
    </details>
  )
}
