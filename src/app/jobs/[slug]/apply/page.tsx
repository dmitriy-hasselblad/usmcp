import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, MapPin } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import type { ReactNode } from "react"

import { submitApplication } from "@/app/applications/actions"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { AuthNotice } from "@/components/auth/auth-notice"
import { AuthSubmitButton } from "@/components/auth/auth-submit-button"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ApplicationStatus } from "@/lib/applications/constants"
import { requireIdentity } from "@/lib/auth/session"
import { getPublishedJobBySlug } from "@/lib/jobs/public-jobs"

export const metadata: Metadata = {
  title: "Apply for a healthcare job",
  description: "Submit a secure job application through SM VIA.",
  robots: { index: false, follow: false },
}

type ApplyPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    error?: string | string[]
    success?: string | string[]
  }>
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ApplyPage({
  params,
  searchParams,
}: ApplyPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const nextPath = `/jobs/${slug}/apply`
  const [identity, job] = await Promise.all([
    requireIdentity(nextPath),
    getPublishedJobBySlug(slug),
  ])

  if (!job || job.source !== "live" || !job.id) {
    notFound()
  }

  const [
    { data: profile },
    { data: professionalProfile },
    { data: resumeData },
    { data: builtResumeData },
    { data: uploadedCoverLetterData },
    { data: builtCoverLetterData },
  ] = await Promise.all([
    identity.supabase
      .from("profiles")
      .select("account_type, first_name, last_name, onboarding_completed")
      .eq("id", identity.userId)
      .single(),
    identity.supabase
      .from("professional_profiles")
      .select("profession, specialty, career_stage, state_code, phone")
      .eq("user_id", identity.userId)
      .maybeSingle(),
    identity.supabase
      .from("professional_documents")
      .select("id, title, is_primary")
      .eq("user_id", identity.userId)
      .eq("document_type", "resume")
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false }),
    identity.supabase
      .from("professional_resumes")
      .select("id, title, created_at")
      .eq("user_id", identity.userId)
      .order("updated_at", { ascending: false }),
    identity.supabase
      .from("professional_documents")
      .select("id, title, created_at")
      .eq("user_id", identity.userId)
      .eq("document_type", "cover_letter")
      .order("created_at", { ascending: false }),
    identity.supabase
      .from("professional_cover_letters")
      .select("id, title, created_at")
      .eq("user_id", identity.userId)
      .order("updated_at", { ascending: false }),
  ])

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type !== "professional" || !professionalProfile) {
    return (
      <ApplyPageShell>
        <Card className="mx-auto max-w-2xl bg-white">
          <CardContent className="p-7 text-center sm:p-10">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <BriefcaseBusiness className="size-6" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              Professional account required
            </h1>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">
              Employer accounts cannot submit job applications. Use a
              healthcare professional account to apply for this opportunity.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/dashboard">Return to dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/jobs">Browse jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </ApplyPageShell>
    )
  }

  const { data: existingApplication } = await identity.supabase
    .from("applications")
    .select("id, status, submitted_at")
    .eq("job_id", job.id)
    .eq("candidate_id", identity.userId)
    .maybeSingle()

  if (existingApplication) {
    return (
      <ApplyPageShell>
        <Card className="mx-auto max-w-2xl bg-white">
          <CardContent className="p-7 text-center sm:p-10">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-6" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
              Application already submitted
            </h1>
            <p className="mt-3 text-muted-foreground">
              You applied for {job.title} at {job.employer}.
            </p>
            <div className="mt-5 flex justify-center">
              <ApplicationStatusBadge
                status={existingApplication.status as ApplicationStatus}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Submitted{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date(existingApplication.submitted_at))}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link
                  href={`/dashboard/applications/${existingApplication.id}`}
                >
                  View application
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/jobs/${job.slug}`}>Back to job</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </ApplyPageShell>
    )
  }

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
  const uploadedResumes = (resumeData ?? []) as ApplicationUploadedResumeOption[]
  const builtResumes = (builtResumeData ?? []) as ApplicationBuiltDocumentOption[]
  const uploadedCoverLetters = (uploadedCoverLetterData ?? []) as ApplicationBuiltDocumentOption[]
  const builtCoverLetters = (builtCoverLetterData ?? []) as ApplicationBuiltDocumentOption[]
  const primaryUploadedResume = uploadedResumes.find((resume) => resume.is_primary)
  const selectedResume = primaryUploadedResume
    ? `uploaded:${primaryUploadedResume.id}`
    : builtResumes[0]
      ? `builder:${builtResumes[0].id}`
      : uploadedResumes[0]
        ? `uploaded:${uploadedResumes[0].id}`
        : ""
  const hasResumeOptions = uploadedResumes.length > 0 || builtResumes.length > 0
  const hasCoverLetterOptions = uploadedCoverLetters.length > 0 || builtCoverLetters.length > 0

  return (
    <ApplyPageShell>
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        href={`/jobs/${job.slug}`}
      >
        <ArrowLeft className="size-4" />
        Back to job details
      </Link>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card className="bg-white">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl tracking-[-0.04em]">
              Submit your application
            </CardTitle>
            <CardDescription>
              Review your profile and tell the employer why this opportunity is
              a strong match.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <AuthNotice
              error={firstValue(query.error)}
              success={firstValue(query.success)}
            />
            <form action={submitApplication} className="mt-5 grid gap-5">
              <input name="jobId" type="hidden" value={job.id} />
              <input name="jobSlug" type="hidden" value={job.slug} />

              <div className="grid gap-4 rounded-xl border border-border bg-muted/35 p-4 sm:grid-cols-2">
                <ProfileField label="Candidate" value={fullName} />
                <ProfileField
                  label="Profession"
                  value={professionalProfile.profession}
                />
                <ProfileField
                  label="Specialty"
                  value={professionalProfile.specialty || "Not specified"}
                />
                <ProfileField
                  label="Location"
                  value={professionalProfile.state_code}
                />
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Phone number
                <Input
                  autoComplete="tel"
                  className="h-11"
                  maxLength={30}
                  minLength={7}
                  name="phone"
                  placeholder="+1 (312) 555-0147"
                  required
                  type="tel"
                  defaultValue={professionalProfile.phone ?? ""}
                />
              </label>

              {hasResumeOptions ? (
                <label className="grid gap-2 text-sm font-medium">
                  Resume or CV{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
                    defaultValue={selectedResume}
                    name="resumeChoice"
                  >
                    <option value="">Apply without a resume</option>
                    {uploadedResumes.map((resume) => (
                      <option key={resume.id} value={`uploaded:${resume.id}`}>
                        {resume.title}
                        {resume.is_primary ? " (Uploaded primary résumé)" : " (Uploaded résumé)"}
                      </option>
                    ))}
                    {builtResumes.map((resume) => (
                      <option key={resume.id} value={`builder:${resume.id}`}>
                        {resume.title} (CV Builder)
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-normal leading-5 text-muted-foreground">
                    Only this employer&apos;s authorized hiring team can open
                    the resume attached to this application.
                  </span>
                </label>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-950">
                    No resume saved
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-900/80">
                    You can apply without a resume, upload one to your private
                    professional profile, or create one with CV Builder.
                  </p>
                  <Button asChild className="mt-3" size="sm" variant="outline">
                    <Link href="/dashboard/profile">
                      Manage profile documents
                    </Link>
                  </Button>
                </div>
              )}

              {hasCoverLetterOptions && (
                <label className="grid gap-2 text-sm font-medium">
                  Attach a cover letter{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                  <select
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
                    name="coverLetterChoice"
                  >
                    <option value="">Do not attach a cover letter</option>
                    {uploadedCoverLetters.map((letter) => (
                      <option key={letter.id} value={`uploaded:${letter.id}`}>
                        {letter.title} (Uploaded cover letter)
                      </option>
                    ))}
                    {builtCoverLetters.map((letter) => (
                      <option key={letter.id} value={`builder:${letter.id}`}>
                        {letter.title} (Cover Letter Builder)
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-normal leading-5 text-muted-foreground">
                    This is separate from your message below. Only the hiring team for this application can open it.
                  </span>
                </label>
              )}

              <label className="grid gap-2 text-sm font-medium">
                Message to the hiring team
                <Textarea
                  maxLength={5000}
                  minLength={30}
                  name="coverLetter"
                  placeholder="Introduce yourself, summarize your relevant experience, and explain your interest in this role."
                  required
                  rows={10}
                />
                <span className="text-xs font-normal text-muted-foreground">
                  30–5,000 characters.
                </span>
              </label>

              <AuthSubmitButton pendingLabel="Submitting application...">
                Submit application
              </AuthSubmitButton>
              <p className="text-xs leading-5 text-muted-foreground">
                By submitting, you agree to share this application and your
                professional profile with the employer&apos;s authorized hiring
                team.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground lg:sticky lg:top-24">
          <CardContent className="p-6">
            <p className="text-xs font-bold tracking-[0.14em] text-teal-100 uppercase">
              Applying for
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
              {job.title}
            </h2>
            <p className="mt-2 font-medium text-blue-100">{job.employer}</p>
            <div className="mt-5 grid gap-3 border-t border-white/15 pt-5 text-sm text-blue-100">
              <span className="flex items-center gap-2">
                <MapPin className="size-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-2">
                <BriefcaseBusiness className="size-4" />
                {job.type} · {job.setting}
              </span>
            </div>
            <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-6 text-blue-100">
              {job.salary}
            </p>
          </CardContent>
        </Card>
      </div>
    </ApplyPageShell>
  )
}

function ApplyPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/35">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

type ApplicationUploadedResumeOption = {
  id: string
  title: string
  is_primary: boolean
}

type ApplicationBuiltDocumentOption = {
  id: string
  title: string
  created_at: string
}
