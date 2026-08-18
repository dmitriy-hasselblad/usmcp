import type { Metadata } from "next"
import Link from "next/link"
import { Flag, ShieldCheck } from "lucide-react"

import { submitAbuseReport } from "./actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { requireIdentity } from "@/lib/auth/session"
import { isSafeInternalPath } from "@/lib/auth/validation"

export const metadata: Metadata = { title: "Report content" }

type Props = {
  searchParams: Promise<{
    error?: string | string[]
    returnTo?: string
    success?: string | string[]
    targetId?: string
    targetType?: string
  }>
}

export default async function ReportContentPage({ searchParams }: Props) {
  const params = await searchParams
  await requireIdentity(`/report?targetType=${encodeURIComponent(params.targetType ?? "")}&targetId=${encodeURIComponent(params.targetId ?? "")}`)
  const returnTo = params.returnTo && isSafeInternalPath(params.returnTo) ? params.returnTo : "/"
  const one = (value?: string | string[]) => Array.isArray(value) ? value[0] : value

  return <div className="min-h-dvh bg-muted/30"><SiteHeader/><main className="mx-auto max-w-2xl px-5 py-12 lg:px-8 lg:py-16"><Link className="text-sm font-semibold text-primary hover:underline" href={returnTo}>← Back to content</Link><div className="mt-8 flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800"><Flag className="size-5"/></span><div><h1 className="text-4xl font-semibold tracking-[-0.05em]">Report content</h1><p className="mt-3 leading-7 text-muted-foreground">Tell the SMVIA platform team about inaccurate, inappropriate, fraudulent, or spam content.</p></div></div><div className="mt-6"><AuthNotice error={one(params.error)} success={one(params.success)}/></div><Card className="mt-6 bg-white"><CardContent className="p-6"><form action={submitAbuseReport} className="grid gap-5"><input name="targetType" type="hidden" value={params.targetType ?? ""}/><input name="targetId" type="hidden" value={params.targetId ?? ""}/><input name="returnTo" type="hidden" value={returnTo}/><label className="grid gap-2 text-sm font-medium">Reason<select className="h-10 rounded-lg border border-input bg-background px-3" name="category" required defaultValue=""><option disabled value="">Choose a reason</option><option value="inaccurate">Inaccurate or misleading</option><option value="inappropriate">Inappropriate content</option><option value="spam">Spam</option><option value="fraud">Fraud or impersonation</option><option value="other">Other concern</option></select></label><label className="grid gap-2 text-sm font-medium">Details<Textarea maxLength={2000} minLength={20} name="details" placeholder="Explain what should be reviewed and why." required rows={7}/><span className="text-xs font-normal text-muted-foreground">20–2,000 characters. Do not include passwords, medical records, or other sensitive personal information.</span></label><Button type="submit">Submit report</Button></form></CardContent></Card><div className="mt-5 flex gap-3 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary"/><p>Your identity and report are private. The reported organization or author cannot view who submitted it.</p></div></main><SiteFooter/></div>
}
