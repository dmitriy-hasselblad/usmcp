import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { ReportContentLink } from "@/components/moderation/report-content-link"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { OrganizationTrustBadge } from "@/components/organizations/organization-trust-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicOrganizationBySlug } from "@/lib/organizations/public-organizations"
import { publicOrganizationLogoUrl } from "@/lib/employer/organization-logo"
import { getAbsoluteUrl, serializeJsonLd } from "@/lib/seo"

type OrganizationPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: OrganizationPageProps): Promise<Metadata> {
  const { slug } = await params
  const organization = await getPublicOrganizationBySlug(slug)

  if (!organization) {
    return { title: "Organization not found" }
  }

  return {
    title: organization.name,
    description:
      organization.description ||
      `Explore healthcare opportunities from ${organization.name}.`,
    alternates: { canonical: `/companies/${organization.slug}` },
    openGraph: {
      type: "website",
      url: `/companies/${organization.slug}`,
      title: organization.name,
      description:
        organization.description ||
        `Explore healthcare opportunities from ${organization.name}.`,
    },
  }
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { slug } = await params
  const organization = await getPublicOrganizationBySlug(slug)

  if (!organization) {
    notFound()
  }

  const activeJobs = organization.jobs.filter((job) => !job.isPlatformDemo)
  const logoUrl = publicOrganizationLogoUrl(organization.logoPath)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization.name,
    url: getAbsoluteUrl(`/companies/${organization.slug}`),
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(organization.website ? { sameAs: [organization.website, organization.linkedinUrl].filter(Boolean) } : organization.linkedinUrl ? { sameAs: [organization.linkedinUrl] } : {}),
    areaServed: { "@type": "Country", name: "United States" },
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
        type="application/ld+json"
      />
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Healthcare organizations", href: "/companies" },
                { label: organization.name },
              ]}
            />
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href="/companies">
              <ArrowLeft className="size-4" /> Back to healthcare organizations
            </Link>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/8 text-primary">
                {logoUrl ? (
                  <Image
                    alt={`${organization.name} logo`}
                    className="size-full bg-white object-contain p-1.5"
                    height={80}
                    src={logoUrl}
                    width={80}
                  />
                ) : (
                  <Building2 className="size-8" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <OrganizationTrustBadge
                  isPlatformDemo={organization.isPlatformProfile}
                  verificationStatus={organization.verificationStatus}
                />
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {organization.name}
                </h1>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4" />
                    {organization.type}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {organization.location}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!organization.isPlatformProfile && (
                  <Button asChild className="rounded-xl" variant="outline">
                    <Link href={`/companies/${organization.slug}/claim`}>
                      Claim this profile <ShieldCheck />
                    </Link>
                  </Button>
                )}
                {organization.linkedinUrl && (
                  <Button asChild className="rounded-xl" variant="outline">
                    <a href={organization.linkedinUrl} rel="noreferrer" target="_blank">
                      <ArrowUpRight /> LinkedIn
                    </a>
                  </Button>
                )}
                {organization.website && (
                  <Button asChild className="rounded-xl" variant="outline">
                    <a href={organization.website} rel="noreferrer" target="_blank">
                      Visit website <ArrowUpRight />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8 lg:py-14">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              About {organization.name}
            </h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
              {organization.description ||
                "This organization has not added a public description yet."}
            </p>
            {organization.isPlatformProfile && (
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                This organization is platform-owned demonstration content. It
                does not represent an independently verified healthcare
                employer.
              </p>
            )}

            <div className="mt-12 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
                  {organization.isPlatformProfile ? "Platform demonstrations" : "Active opportunities"}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  {organization.isPlatformProfile ? "Demonstration listings" : "Published roles"}
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {organization.isPlatformProfile
                  ? `${organization.jobs.length} demonstrations`
                  : `${activeJobs.length} ${activeJobs.length === 1 ? "role" : "roles"}`}
              </span>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {organization.jobs.map((job) => (
                <JobCard job={job} key={job.id ?? job.slug} />
              ))}
            </div>
          </div>

          <aside>
            <Card className="sticky top-24 border-primary/15 bg-white">
              <CardContent className="p-6">
                <ShieldCheck className="size-6 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">
                  Public profile information
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This page shows only organization details approved for public
                  display and roles currently published on SM VIA. Membership and
                  private contact information are not shown.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <div className="mx-auto flex max-w-7xl justify-end px-5 pb-8 lg:px-8"><ReportContentLink returnTo={`/companies/${organization.slug}`} targetId={organization.id} targetType="organization" /></div>
      <SiteFooter />
    </div>
  )
}
