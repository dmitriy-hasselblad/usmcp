import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

export function LegalPageShell({
  children,
  description,
  lastUpdated,
  title,
}: {
  children: React.ReactNode
  description: string
  lastUpdated: string
  title: string
}) {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#f8fcff_0%,#eef8f8_100%)]">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20 lg:px-8">
            <Link
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              href="/"
            >
              <ArrowLeft className="size-4" />
              Back to USHCE
            </Link>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase">
              <ShieldCheck className="size-4" />
              Privacy and trust
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              {description}
            </p>
            <p className="mt-5 text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16 lg:px-8">
          <div className="legal-content">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
