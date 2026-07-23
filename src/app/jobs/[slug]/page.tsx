import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { featuredJobs, getJobBySlug } from "@/lib/marketing-data"

type JobPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return featuredJobs.map((job) => ({ slug: job.slug }))
}

export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  const { slug } = await params
  const job = getJobBySlug(slug)

  if (!job) {
    return { title: "Job not found" }
  }

  return {
    title: `${job.title} at ${job.employer}`,
    description: `${job.title} product-preview listing in ${job.location}.`,
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params
  const job = getJobBySlug(slug)

  if (!job) {
    notFound()
  }

  const relatedJobs = featuredJobs
    .filter(
      (candidate) =>
        candidate.slug !== job.slug &&
        (candidate.specialty === job.specialty ||
          candidate.employer === job.employer)
    )
    .slice(0, 2)

  return (
    <div className="min-h-dvh bg-muted/30">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              href="/jobs"
            >
              <ArrowLeft className="size-4" />
              Back to healthcare jobs
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Product preview</Badge>
                  <Badge variant="outline">{job.specialty}</Badge>
                  {job.visaSupport && (
                    <Badge variant="outline">Potential visa support</Badge>
                  )}
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {job.title}
                </h1>
                <p className="mt-3 text-lg font-semibold text-primary">
                  {job.employer}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness className="size-4" />
                    {job.type} · {job.setting}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4" />
                    {job.posted}
                  </span>
                </div>
              </div>
              <div className="lg:text-right">
                <p className="text-sm text-muted-foreground">
                  Estimated annual salary
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.035em]">
                  {job.salary}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-8 lg:py-14">
          <div className="grid gap-6">
            <Card className="border-border/80 bg-white">
              <CardHeader>
                <CardTitle>About this role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">{job.summary}</p>
              </CardContent>
            </Card>

            <JobSection items={job.responsibilities} title="What you will do" />
            <JobSection items={job.qualifications} title="Qualifications" />
            <JobSection items={job.benefits} title="Benefits" />
          </div>

          <aside>
            <Card className="sticky top-24 border-primary/15 bg-white shadow-[0_16px_40px_rgba(15,76,129,0.1)]">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
                  <Building2 className="size-5" />
                </span>
                <h2 className="mt-5 text-lg font-semibold">
                  Interested in this role?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This sample listing demonstrates the planned application
                  experience. It is not an active vacancy.
                </p>
                <Button asChild className="mt-6 h-11 w-full rounded-xl">
                  <Link href="/sign-up">
                    Prepare your profile <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="mt-2 h-11 w-full rounded-xl"
                  variant="outline"
                >
                  <Link href={`/jobs?query=${encodeURIComponent(job.employer)}`}>
                    More from this organization
                  </Link>
                </Button>
                <div className="mt-5 flex gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  Employer verification and live applications will be enabled
                  before marketplace launch.
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {relatedJobs.length > 0 && (
          <section className="border-t border-border bg-white">
            <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
                    Continue exploring
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
                    Related preview roles
                  </h2>
                </div>
                <Button
                  asChild
                  className="hidden rounded-xl sm:inline-flex"
                  variant="outline"
                >
                  <Link href="/jobs">View all roles</Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {relatedJobs.map((relatedJob) => (
                  <JobCard job={relatedJob} key={relatedJob.slug} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

function JobSection({ items, title }: { items: string[]; title: string }) {
  return (
    <Card className="border-border/80 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3">
          {items.map((item) => (
            <li className="flex gap-3 leading-7 text-muted-foreground" key={item}>
              <span className="mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                <Check className="size-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
