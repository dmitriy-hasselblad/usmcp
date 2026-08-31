import type { Metadata } from "next"
import Image from "next/image"
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
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { JobDescriptionContent } from "@/lib/jobs/rich-text"
import { AnalyticsLink } from "@/components/analytics/analytics-link"
import { ReportContentLink } from "@/components/moderation/report-content-link"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { OrganizationTrustBadge } from "@/components/organizations/organization-trust-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getPublishedJobBySlug,
  getPublishedJobs,
} from "@/lib/jobs/public-jobs"
import {
  formatNewsDate,
  getLatestPublishedOrganizationPost,
} from "@/lib/news/public-news"
import { featuredJobs, getJobBySlug, type Job } from "@/lib/marketing-data"
import { getAbsoluteUrl, serializeJsonLd } from "@/lib/seo"

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
  const job = (await getPublishedJobBySlug(slug)) ?? getJobBySlug(slug)

  if (!job) {
    return { title: "Job not found" }
  }

  const isLive = job.source === "live" && !job.isPlatformDemo

  return {
    title: `${job.title} at ${job.employer}`,
    description: `${job.title} healthcare opportunity in ${job.location}.`,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      type: "article",
      url: `/jobs/${job.slug}`,
      title: `${job.title} at ${job.employer}`,
      description: `${job.title} healthcare opportunity in ${job.location}.`,
    },
    ...(isLive ? {} : { robots: { index: false, follow: false } }),
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params
  const job = (await getPublishedJobBySlug(slug)) ?? getJobBySlug(slug)

  if (!job) {
    notFound()
  }

  const isLive = job.source === "live" && !job.isPlatformDemo
  const jobPosting = isLive && job.publishedAt ? getJobPosting(job) : null
  const [liveJobs, latestOrganizationPost] = await Promise.all([
    getPublishedJobs(),
    job.source === "live" && job.organizationId
      ? getLatestPublishedOrganizationPost(job.organizationId)
      : Promise.resolve(null),
  ])
  const relatedJobs = getRelatedJobs(job, isLive ? liveJobs : featuredJobs)

  return (
    <div className="min-h-dvh bg-muted/30">
      {jobPosting && (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jobPosting) }}
          type="application/ld+json"
        />
      )}
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Healthcare jobs", href: "/jobs" },
                { label: job.title },
              ]}
            />
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href="/jobs">
              <ArrowLeft className="size-4" /> Back to healthcare jobs
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      isLive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : undefined
                    }
                    variant={isLive ? "outline" : "default"}
                  >
                    {job.isPlatformDemo
                      ? "Platform demonstration"
                      : isLive
                        ? "Live opportunity"
                        : "Product preview"}
                  </Badge>
                  {job.source === "live" && !job.isPlatformDemo && (
                    <OrganizationTrustBadge
                      showNeutral={false}
                      verificationStatus={job.organizationVerificationStatus}
                    />
                  )}
                  <Badge variant="outline">{job.specialty}</Badge>
                  {job.visaSupport && (
                    <Badge variant="outline">Potential visa support</Badge>
                  )}
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {job.title}
                </h1>
                <p className="mt-3 text-lg font-semibold text-primary">
                  {isLive && job.employerSlug ? (
                    <Link
                      className="hover:underline"
                      href={`/companies/${job.employerSlug}`}
                    >
                      {job.employer}
                    </Link>
                  ) : (
                    job.employer
                  )}
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
                  {job.source === "live" && typeof job.openPositions === "number" && (
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="size-4" />
                      {job.openPositions} {job.openPositions === 1 ? "open position" : "open positions"}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4" />
                    {job.posted}
                  </span>
                </div>
              </div>
              <div className="lg:text-right">
                <p className="text-sm text-muted-foreground">
                  Compensation
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
                <JobDescriptionContent value={job.description ?? job.summary} />
              </CardContent>
            </Card>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <Card className="border-border/80 bg-white">
                <CardHeader>
                  <CardTitle>Required skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <Badge
                        className="border-primary/15 bg-primary/5 px-2.5 py-1 text-sm text-primary"
                        key={skill}
                        variant="outline"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {job.responsibilities.length > 0 && (
              <JobSection items={job.responsibilities} title="What you will do" />
            )}
            {job.qualifications.length > 0 && (
              <JobSection items={job.qualifications} title="Qualifications" />
            )}
            {job.benefits.length > 0 && (
              <JobSection items={job.benefits} title="Benefits" />
            )}
          </div>

          <aside>
            <div className="sticky top-24 grid gap-4">
            <Card className="border-primary/15 bg-white shadow-[0_16px_40px_rgba(15,76,129,0.1)]">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary">
                  <Building2 className="size-5" />
                </span>
                <h2 className="mt-5 text-lg font-semibold">
                  Interested in this role?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isLive
                    ? "This opportunity was published directly by the employer. Submit your profile and application securely through SM VIA."
                    : job.isPlatformDemo
                      ? "This platform demonstration is not an active vacancy. Applications are disabled."
                      : "This sample listing demonstrates the planned application experience. It is not an active vacancy."}
                </p>
                <Button asChild className="mt-6 h-11 w-full rounded-xl">
                  <AnalyticsLink
                    eventData={{ source: isLive ? "live_job" : "demonstration" }}
                    eventName={isLive ? "job_application_started" : "demonstration_job_browsed"}
                    href={isLive ? `/jobs/${job.slug}/apply` : "/jobs"}
                  >
                    {isLive ? "Apply now" : job.isPlatformDemo ? "Browse active jobs" : "Prepare your profile"}{" "}
                    <ArrowRight />
                  </AnalyticsLink>
                </Button>
                <Button
                  asChild
                  className="mt-2 h-11 w-full rounded-xl"
                  variant="outline"
                >
                  <Link
                    href={
                      isLive && job.employerSlug
                        ? `/companies/${job.employerSlug}`
                        : `/jobs?query=${encodeURIComponent(job.employer)}`
                    }
                  >
                    More from this organization
                  </Link>
                </Button>
                <div className="mt-5 flex gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  {isLive
                    ? "Your application is shared only with this employer's authorized hiring team."
                    : "Demonstration listings are excluded from applications and JobPosting search metadata."}
                </div>
              </CardContent>
            </Card>
            {job.source === "live" && job.expiresAt && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="flex gap-3 p-4">
                  <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-800" />
                  <div>
                    <h2 className="font-semibold text-amber-950">
                      Application deadline
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      This opportunity closes on {new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(job.expiresAt))}. Applications are not accepted after this date.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {latestOrganizationPost && (
              <Card className="overflow-hidden border-border bg-white">
                {latestOrganizationPost.cover_image_path && (
                  <div className="relative aspect-[16/9]">
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      sizes="(max-width: 1024px) 100vw, 21rem"
                      src={`/news/image/${latestOrganizationPost.id}`}
                    />
                  </div>
                )}
                <CardContent className="p-5">
                  <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
                    Latest from {job.employer}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Published {formatNewsDate(latestOrganizationPost.published_at)}
                  </p>
                  <h2 className="mt-3 text-lg font-semibold leading-6">
                    <Link className="hover:text-primary" href={`/news/${latestOrganizationPost.slug}`}>
                      {latestOrganizationPost.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {latestOrganizationPost.excerpt}
                  </p>
                  <Link
                    className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                    href={`/news?organization=${job.organizationId}`}
                  >
                    View all updates from {job.employer} →
                  </Link>
                </CardContent>
              </Card>
            )}
            </div>
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
                    Similar healthcare opportunities
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
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {relatedJobs.map((relatedJob) => (
                  <JobCard job={relatedJob} key={relatedJob.slug} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      {isLive && job.id && <div className="mx-auto flex max-w-7xl justify-end px-5 pb-8 lg:px-8"><ReportContentLink returnTo={`/jobs/${job.slug}`} targetId={job.id} targetType="job" /></div>}
      <SiteFooter />
    </div>
  )
}

function getRelatedJobs(currentJob: Job, candidates: Job[]) {
  const currentSkills = new Set(
    (currentJob.requiredSkills ?? []).map((skill) => skill.toLocaleLowerCase()),
  )

  return candidates
    .filter(
      (candidate) =>
        candidate.slug !== currentJob.slug && !candidate.isPlatformDemo,
    )
    .map((candidate) => {
      const sharedSkills = (candidate.requiredSkills ?? []).filter((skill) =>
        currentSkills.has(skill.toLocaleLowerCase()),
      ).length
      const score =
        (candidate.profession === currentJob.profession ? 6 : 0) +
        (candidate.specialty === currentJob.specialty ? 5 : 0) +
        (candidate.stateCode === currentJob.stateCode ? 3 : 0) +
        sharedSkills +
        (candidate.organizationId === currentJob.organizationId ? 1 : 0)

      return { candidate, score }
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.candidate.publishedAt ?? "").localeCompare(a.candidate.publishedAt ?? ""),
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate)
}

function getJobPosting(job: Job) {
  const employmentType =
    {
      "Full-time": "FULL_TIME",
      "Part-time": "PART_TIME",
      Contract: "CONTRACTOR",
      Temporary: "TEMPORARY",
      "Per diem": "OTHER",
    }[job.type] ?? "OTHER"

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.summary,
    datePosted: job.publishedAt,
    ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
    directApply: true,
    employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: job.employer,
      ...(job.organizationWebsite ? { sameAs: job.organizationWebsite } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: job.stateCode,
        addressCountry: "US",
      },
    },
    ...(job.salaryMin
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin,
              ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
              unitText: job.salaryPeriod === "hour" ? "HOUR" : "YEAR",
            },
          },
        }
      : {}),
    url: getAbsoluteUrl(`/jobs/${job.slug}`),
  }
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
