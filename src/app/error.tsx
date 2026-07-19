"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The error boundary intentionally avoids exposing implementation details to visitors.
  }, [])

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 p-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-bold tracking-[0.14em] text-primary uppercase">Something went wrong</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Let’s try that again.</h1>
        <p className="mt-4 text-muted-foreground">The page could not be loaded right now. Please retry in a moment.</p>
        <Button className="mt-7 h-11 rounded-xl px-5" onClick={reset}>Try again</Button>
      </div>
    </main>
  )
}
