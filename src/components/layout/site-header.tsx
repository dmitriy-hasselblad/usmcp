import Link from "next/link"
import { LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
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

  return {
    email: typeof claims.email === "string" ? claims.email : undefined,
  }
}

export async function SiteHeader() {
  const identity = await getHeaderIdentity()

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="USHCE home">
          <UshceLogo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
              {identity.email && (
                <span className="hidden max-w-48 truncate text-sm text-muted-foreground xl:inline">
                  {identity.email}
                </span>
              )}
              <Button asChild className="h-10 rounded-xl px-4 shadow-sm">
                <Link href="/dashboard">
                  <LayoutDashboard />
                  My workspace
                </Link>
              </Button>
              <form action="/auth/sign-out" method="post">
                <Button className="h-10 px-4" type="submit" variant="ghost">
                  <LogOut />
                  Sign out
                </Button>
              </form>
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
                <UshceLogo />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation for the USHCE website.
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 py-5" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
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
                        {identity.email ?? "USHCE member"}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="h-11">
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      My workspace
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
