"use client"

import Link from "next/link"
import { Menu } from "lucide-react"

import { UsmcpLogo } from "@/components/brand/usmcp-logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navigation = [
  { href: "#featured-jobs", label: "Jobs" },
  { href: "#employers", label: "For employers" },
  { href: "#career-paths", label: "Residency" },
  { href: "#resources", label: "Career resources" },
  { href: "#get-started", label: "Pricing" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="#top" aria-label="USMCP home">
          <UsmcpLogo />
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
          <Button asChild className="h-10 px-4" variant="ghost">
            <Link href="#get-started">Sign in</Link>
          </Button>
          <Button asChild className="h-10 rounded-xl px-4 shadow-sm">
            <Link href="#get-started">Create an account</Link>
          </Button>
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
                <UsmcpLogo />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation for the USMCP website.
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
              <Button asChild className="h-11" variant="outline">
                <Link href="#get-started">Sign in</Link>
              </Button>
              <Button asChild className="h-11">
                <Link href="#get-started">Create an account</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
