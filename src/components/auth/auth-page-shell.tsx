import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { UshceLogo } from "@/components/brand/ushce-logo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthPageShellProps = {
  children: ReactNode
  description: string
  eyebrow: string
  footer: ReactNode
  title: string
  wide?: boolean
}

export function AuthPageShell({
  children,
  description,
  eyebrow,
  footer,
  title,
  wide = false,
}: AuthPageShellProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[linear-gradient(135deg,#f8fcff_0%,#edf8f6_50%,#f6fbff_100%)] px-5 py-10">
      <div className={cn("w-full", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="mb-7 flex items-center justify-between">
          <Link aria-label="USHCE home" href="/">
            <UshceLogo />
          </Link>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            href="/"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>

        <Card className="border-border/80 bg-white shadow-[0_24px_60px_rgba(15,76,129,0.12)]">
          <CardHeader className="pb-2">
            <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
              {eyebrow}
            </p>
            <CardTitle className="pt-2 text-2xl tracking-[-0.04em]">
              {title}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 pt-3">{children}</CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      </div>
    </main>
  )
}
