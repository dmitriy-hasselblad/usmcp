"use client"

import { CheckCircle2, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const storageKey = "smvia-early-access-notice-v1"

export function EarlyAccessNotice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(window.localStorage.getItem(storageKey) !== "dismissed")
  }, [])

  const dismiss = () => {
    window.localStorage.setItem(storageKey, "dismissed")
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      aria-labelledby="early-access-title"
      aria-modal="true"
      className="fixed inset-0 z-100 grid place-items-center bg-slate-950/45 px-5 py-8 backdrop-blur-[2px]"
      role="dialog"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-white/50 bg-white p-6 shadow-2xl sm:p-8">
        <button
          aria-label="Close early access notice"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          onClick={dismiss}
          type="button"
        >
          <X className="size-5" />
        </button>

        <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-primary uppercase">
          Early Access
        </p>
        <h2 className="mt-2 pr-8 text-3xl font-semibold tracking-[-0.045em] text-foreground" id="early-access-title">
          Welcome to SM VIA.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          SM VIA is at the beginning of its journey. During Early Access, all
          features for healthcare professionals and employers are free to use,
          with no limits on job postings or applications.
        </p>
        <div className="mt-5 rounded-2xl border border-primary/10 bg-slate-50 p-4 text-sm leading-6 text-muted-foreground">
          Before any paid services begin, we will publish a clear announcement
          at least 30 days in advance.
        </div>
        <Button className="mt-6 w-full" onClick={dismiss} size="lg" type="button">
          Continue to SM VIA
        </Button>
      </div>
    </div>
  )
}
