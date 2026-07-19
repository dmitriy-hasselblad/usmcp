import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 p-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-bold tracking-[0.14em] text-primary uppercase">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">That page is not here.</h1>
        <p className="mt-4 text-muted-foreground">Let’s take you back to the USMCP career portal.</p>
        <Button asChild className="mt-7 h-11 rounded-xl px-5">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  )
}
