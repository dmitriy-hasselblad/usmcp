import type { Metadata } from "next"
import type React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Lightbulb, Search } from "lucide-react"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { careerPaths, getCareerPath, type CareerPathReadiness } from "@/lib/career-paths/content"

export function generateStaticParams() { return careerPaths.map((path) => ({ slug: path.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const path = getCareerPath(slug)
  if (!path) return {}
  return { title: path.title, description: path.summary, alternates: { canonical: `/career-paths/${path.slug}` } }
}

export default async function CareerPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const path = getCareerPath(slug)
  if (!path) notFound()
  return <div className="min-h-dvh bg-background"><SiteHeader /><main>
    <section className="border-b border-border bg-[linear-gradient(135deg,#f7fbff_0%,#eaf8f5_54%,#f9fcff_100%)]"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><Button asChild size="sm" variant="ghost"><Link href="/career-paths"><ArrowLeft />All career paths</Link></Button><Badge className="mt-8 border-primary/15 bg-primary/5 text-primary" variant="outline">{path.eyebrow}</Badge><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{path.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{path.summary}</p></div></section>
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14"><div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,.75fr)]"><div className="grid gap-8"><section><Header icon={<Compass />} title="Your starting point" /><p className="mt-4 rounded-2xl border border-border bg-muted/35 p-5 leading-7 text-muted-foreground">{path.startingPoint}</p></section><section><Header icon={<CheckCircle2 />} title="Transferable strengths" /><div className="mt-4 flex flex-wrap gap-2">{path.transferableSkills.map((skill) => <Badge className="h-auto border-teal-700/15 bg-teal-50 px-3 py-1 text-teal-900" key={skill} variant="outline">{skill}</Badge>)}</div></section><section><Header icon={<Lightbulb />} title="Directions to explore" /><div className="mt-5 grid gap-4">{path.options.map((option) => <article className="rounded-2xl border border-border bg-white p-5" key={option.title}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><h3 className="font-semibold">{option.title}</h3><ReadinessBadge readiness={option.readiness} /></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{option.description}</p><p className="mt-4 text-xs font-semibold tracking-[0.1em] text-primary uppercase">Example titles</p><p className="mt-2 text-sm leading-6 text-foreground">{option.jobTitles.join(" · ")}</p></article>)}</div></section><section><Header icon={<Search />} title="Questions to answer before you commit" /><ul className="mt-4 grid gap-3">{path.questions.map((question) => <li className="flex gap-3 rounded-xl border border-border p-4 text-sm leading-6" key={question}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">?</span>{question}</li>)}</ul></section></div><aside className="h-fit rounded-2xl border border-teal-700/20 bg-[linear-gradient(135deg,#ecfbf7_0%,#f4faff_100%)] p-6 lg:sticky lg:top-24"><p className="text-xs font-bold tracking-[0.13em] text-teal-800 uppercase">Your next 30 days</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Make the next move evidence-led.</h2><ol className="mt-5 grid gap-4">{path.nextSteps.map((step, index) => <li className="flex gap-3 text-sm leading-6 text-muted-foreground" key={step}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">{index + 1}</span>{step}</li>)}</ol><div className="mt-7 grid gap-3"><Button asChild className="h-10 rounded-xl"><Link href="/jobs">Search current roles <ArrowRight /></Link></Button><Button asChild className="h-10 rounded-xl" variant="outline"><Link href={path.resourceHref ?? "/resources"}>{path.resourceLabel ?? "Explore career resources"} <ArrowRight /></Link></Button><Button asChild className="h-10 rounded-xl" variant="outline"><Link href="/dashboard/profile">Build your professional profile <ArrowRight /></Link></Button></div></aside></div></section>
    <section className="border-t border-border bg-muted/30"><div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><p className="max-w-3xl text-sm leading-6 text-muted-foreground"><strong>Important:</strong> This route is general career guidance, not a guarantee of eligibility, employment, salary, licensure, visa status, or admission. Confirm current requirements with employers, official licensing authorities, and qualified advisers where appropriate.</p></div></section>
  </main><SiteFooter /></div>
}

function Header({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span><h2 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h2></div> }

function ReadinessBadge({ readiness }: { readiness: CareerPathReadiness }) { const classes = readiness === "Explore now" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : readiness === "Develop in parallel" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700"; return <Badge className={classes} variant="outline">{readiness}</Badge> }
