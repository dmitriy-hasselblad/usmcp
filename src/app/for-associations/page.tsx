import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgeCheck, BookOpenCheck, Building2, Handshake, ShieldCheck, UsersRound } from "lucide-react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "For Healthcare Associations",
  description: "Help your healthcare association members discover career opportunities and practical guidance through SM VIA during Early Access.",
  alternates: { canonical: "/for-associations" },
}

const benefits = [
  { title: "For your members", description: "Career opportunities, professional profiles, state licensure guidance, salary context, and practical career resources in one place.", icon: UsersRound },
  { title: "For your organization", description: "A dedicated association profile that helps members and relevant healthcare organizations understand your mission and resources.", icon: Building2 },
  { title: "For your community", description: "A clear route to share trusted career information, relevant employers, and useful professional-development resources.", icon: BookOpenCheck },
]

const steps = [
  "Tell us about your association and the community you serve.",
  "We review the public information and discuss the best profile format.",
  "Share SM VIA resources and opportunities with your members when useful.",
]

export default function ForAssociationsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="overflow-hidden border-b border-primary/10 bg-[linear-gradient(135deg,#f7fbff_0%,#edf9f7_52%,#f8fcff_100%)]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <Badge className="border-teal-700/15 bg-teal-700/10 text-teal-800" variant="outline">Association Early Access</Badge>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">Give your members another way to move forward.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">SM VIA helps healthcare associations connect members with relevant opportunities, practical career guidance, and trusted organizations — at no cost during Early Access.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-xl px-5 shadow-sm"><Link href="/contact?topic=Partnership">Request an association profile <ArrowRight /></Link></Button>
                <Button asChild className="h-12 rounded-xl px-5" variant="outline"><Link href="/resources">Explore career resources</Link></Button>
              </div>
            </div>
            <Card className="border-primary/10 bg-white/85 shadow-lg shadow-primary/5">
              <CardContent className="p-6 sm:p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-teal-700 text-white"><Handshake className="size-6" /></span>
                <p className="mt-6 text-sm font-semibold text-teal-800">During Early Access</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">No participation fee.</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">We welcome associations that want to share useful career support and provide feedback as SM VIA grows.</p>
                <div className="mt-6 grid gap-3 border-t border-border pt-6 text-sm">
                  {["No cost to participate during Early Access", "Dedicated association profile discussion", "Direct contact with the SM VIA team"].map((item) => <div className="flex items-start gap-3" key={item}><ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-700" /><span className="font-medium text-foreground">{item}</span></div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">A useful member benefit</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Career support that complements your association&apos;s work.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">SM VIA is not a replacement for your professional community. It is an additional pathway for members who need practical next steps.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => { const Icon = benefit.icon; return <Card className="border-border/80 bg-white" key={benefit.title}><CardContent className="p-6"><span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-5" /></span><h3 className="mt-5 text-xl font-semibold tracking-[-0.035em]">{benefit.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.description}</p></CardContent></Card> })}
          </div>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
            <div><BadgeCheck className="size-7 text-primary" /><h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">Start with a conversation.</h2><p className="mt-4 max-w-md leading-7 text-muted-foreground">Each association serves a different professional community. We will discuss the right way to present your resources before creating a profile.</p></div>
            <ol className="grid gap-4">{steps.map((step, index) => <li className="flex gap-4 rounded-2xl border border-border bg-white p-5" key={step}><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">{index + 1}</span><span className="pt-1 text-sm font-medium leading-6 text-foreground">{step}</span></li>)}</ol>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8 lg:py-24">
          <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Let&apos;s build something useful</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Interested in an association profile?</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">Tell us about your association, the professionals you support, and the resources that matter most to your community.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild className="h-12 rounded-xl px-5 shadow-sm"><Link href="/contact?topic=Partnership">Talk to SM VIA <ArrowRight /></Link></Button><Button asChild className="h-12 rounded-xl px-5" variant="outline"><Link href="/companies">Explore organizations</Link></Button></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
