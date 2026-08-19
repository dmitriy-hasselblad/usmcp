import type { Metadata } from "next"
import { Building2, HeartHandshake, LockKeyhole, Mail, ShieldCheck } from "lucide-react"

import { submitContactMessage } from "./actions"
import { AuthNotice } from "@/components/auth/auth-notice"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export const metadata: Metadata = {
  title: "Contact SM VIA",
  description: "Contact the SM VIA team for platform, employer, privacy, and Early Access questions.",
}

type Props = { searchParams: Promise<{ error?: string | string[]; success?: string | string[] }> }

const one = (value?: string | string[]) => Array.isArray(value) ? value[0] : value

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="min-h-dvh bg-muted/30">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary"><HeartHandshake className="size-4" /> Contact SM VIA</span>
            <div className="mt-6 max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-6xl">A clear way to reach the team behind your next step.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Questions about jobs, employer participation, your account, or privacy? Send a message to the SM VIA team. We are building this U.S.-focused healthcare career platform with care, clarity, and respect for your information.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-7 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="grid content-start gap-5">
            <Card className="bg-white"><CardContent className="p-6"><Mail className="size-6 text-primary" /><h2 className="mt-4 text-xl font-semibold">Real people, clear purpose</h2><p className="mt-2 leading-7 text-muted-foreground">SM VIA is an Early Access platform for healthcare professionals and organizations in the United States. Messages submitted here go directly to the platform team.</p></CardContent></Card>
            <Card className="bg-white"><CardContent className="p-6"><ShieldCheck className="size-6 text-primary" /><h2 className="mt-4 text-xl font-semibold">Privacy-first communication</h2><p className="mt-2 leading-7 text-muted-foreground">Please do not send passwords, Social Security numbers, patient records, or other sensitive medical information. For account security and privacy questions, choose the relevant topic below.</p></CardContent></Card>
            <Card className="bg-white"><CardContent className="p-6"><Building2 className="size-6 text-primary" /><h2 className="mt-4 text-xl font-semibold">For healthcare organizations</h2><p className="mt-2 leading-7 text-muted-foreground">Employers can ask about organization onboarding, published jobs, team access, verification, and Early Access participation.</p></CardContent></Card>
            <div className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-6 text-muted-foreground"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" /><p>Using this form does not create a SM VIA account or add you to marketing communications.</p></div>
          </div>

          <Card className="bg-white"><CardContent className="p-6 sm:p-8"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Send a message</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">How can we help?</h2><p className="mt-3 leading-7 text-muted-foreground">We will use your email only to respond to this request.</p></div><div className="mt-6"><AuthNotice error={one(params.error)} success={one(params.success)} /></div><form action={submitContactMessage} className="mt-6 grid gap-5"><input aria-hidden="true" autoComplete="off" className="hidden" name="website" tabIndex={-1} type="text" /><label className="grid gap-2 text-sm font-medium">Name<Input autoComplete="name" className="h-11" maxLength={100} minLength={2} name="name" placeholder="Your name" required /></label><label className="grid gap-2 text-sm font-medium">Email<Input autoComplete="email" className="h-11" maxLength={254} name="email" placeholder="you@example.com" required type="email" /></label><label className="grid gap-2 text-sm font-medium">Topic<select className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20" defaultValue="" name="topic" required><option disabled value="">Choose a topic</option><option>General question</option><option>Account support</option><option>Employer support</option><option>Privacy request</option><option>Partnership</option><option>Other</option></select></label><label className="grid gap-2 text-sm font-medium">Message<Textarea maxLength={3000} minLength={20} name="message" placeholder="Tell us how we can help." required rows={8} /><span className="text-xs font-normal leading-5 text-muted-foreground">20–3,000 characters. Do not include patient information or other sensitive personal data.</span></label><Button className="h-11 w-full sm:w-auto" type="submit">Send message</Button></form></CardContent></Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
