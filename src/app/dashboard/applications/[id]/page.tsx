import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react"
import { notFound, redirect } from "next/navigation"

import {
  sendApplicationMessage,
  updateApplicationStatus,
  withdrawApplication,
} from "@/app/applications/actions"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { AuthNotice } from "@/components/auth/auth-notice"
import { EmployerDashboardShell } from "@/components/employer/employer-dashboard-shell"
import { ProfessionalDashboardShell } from "@/components/professional/professional-dashboard-shell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  employerApplicationStatuses,
  withdrawableApplicationStatuses,
  type ApplicationRecord,
  type ApplicationStatus,
} from "@/lib/applications/constants"
import { requireIdentity } from "@/lib/auth/session"
import { canManageJobs } from "@/lib/employer/constants"
import { requireEmployerWorkspace } from "@/lib/employer/session"
import {
  educationTypeLabels,
  type CertificationRecord,
  type EducationRecord,
  type ExperienceRecord,
  type LicenseRecord,
  type StructuredCareerProfile,
} from "@/lib/professional/career-records"
import type {
  ProfessionalProfileRecord,
  ProfessionalSkillRecord,
} from "@/lib/professional/constants"

export const metadata: Metadata = {
  title: "Application details",
  description: "Review a healthcare job application in USHCE.",
}

type ApplicationPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    error?: string | string[]
    success?: string | string[]
  }>
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

export default async function ApplicationPage({
  params,
  searchParams,
}: ApplicationPageProps) {
  const [{ id }, query, identity] = await Promise.all([
    params,
    searchParams,
    requireIdentity("/dashboard/applications"),
  ])

  if (!isUuid(id)) {
    notFound()
  }

  const { data: profile } = await identity.supabase
    .from("profiles")
    .select("account_type, onboarding_completed")
    .eq("id", identity.userId)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  if (profile.account_type === "employer") {
    return <EmployerApplication applicationId={id} query={query} />
  }

  const { data } = await identity.supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("candidate_id", identity.userId)
    .maybeSingle()

  if (!data) {
    notFound()
  }

  const application = data as ApplicationRecord
  const messages = await getApplicationMessages(identity.supabase, application.id)

  return (
    <ProfessionalDashboardShell active="applications" email={identity.email}>
      <BackLink />
      <ApplicationHeading application={application} perspective="candidate" />
      <div className="mt-7">
        <AuthNotice
          error={firstValue(query.error)}
          success={firstValue(query.success)}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <ApplicationBody application={application} messages={messages} perspective="candidate" />
        <Card className="h-fit bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Application status
            </p>
            <ApplicationStatusBadge
              className="mt-4"
              status={application.status}
            />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Submitted {formatDate(application.submitted_at)}. Status changes
              from the hiring team will appear here.
            </p>
            <Button asChild className="mt-5 w-full" variant="outline">
              <Link href={`/jobs/${application.job_slug}`}>View job</Link>
            </Button>
            {withdrawableApplicationStatuses.includes(application.status) && (
              <form action={withdrawApplication} className="mt-2">
                <input
                  name="applicationId"
                  type="hidden"
                  value={application.id}
                />
                <Button className="w-full" type="submit" variant="destructive">
                  Withdraw application
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </ProfessionalDashboardShell>
  )
}

async function EmployerApplication({
  applicationId,
  query,
}: {
  applicationId: string
  query: Awaited<ApplicationPageProps["searchParams"]>
}) {
  const workspace = await requireEmployerWorkspace(
    `/dashboard/applications/${applicationId}`,
  )
  const { data } = await workspace.supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle()

  if (!data) {
    notFound()
  }

  const application = data as ApplicationRecord
  const messages = await getApplicationMessages(workspace.supabase, application.id)
  const canEdit = canManageJobs(workspace.membership.role)
  const [educationResult, experienceResult, licenseResult, certificationResult, extendedResult, skillsResult] =
    await Promise.all([
      workspace.supabase
        .from("professional_education")
        .select("*")
        .eq("user_id", application.candidate_id)
        .order("start_date", { ascending: false }),
      workspace.supabase
        .from("professional_experience")
        .select("*")
        .eq("user_id", application.candidate_id)
        .order("start_date", { ascending: false }),
      workspace.supabase
        .from("professional_licenses")
        .select("*")
        .eq("user_id", application.candidate_id)
        .order("expires_on", { ascending: true }),
      workspace.supabase
        .from("professional_certifications")
        .select("*")
        .eq("user_id", application.candidate_id)
        .order("issued_on", { ascending: false }),
      workspace.supabase
        .from("professional_profiles")
        .select("*")
        .eq("user_id", application.candidate_id)
        .maybeSingle(),
      workspace.supabase
        .from("professional_skills")
        .select("*")
        .eq("user_id", application.candidate_id)
        .order("name"),
    ])
  const careerProfile: StructuredCareerProfile = {
    education: (educationResult.data ?? []) as EducationRecord[],
    experience: (experienceResult.data ?? []) as ExperienceRecord[],
    licenses: (licenseResult.data ?? []) as LicenseRecord[],
    certifications: (certificationResult.data ?? []) as CertificationRecord[],
  }
  const extendedProfile = extendedResult.data
    ? (extendedResult.data as ProfessionalProfileRecord)
    : null
  const skills = (skillsResult.data ?? []) as ProfessionalSkillRecord[]

  return (
    <EmployerDashboardShell
      active="applications"
      email={workspace.email}
      organizationName={workspace.organization.name}
    >
      <BackLink />
      <ApplicationHeading application={application} perspective="employer" />
      <div className="mt-7">
        <AuthNotice
          error={firstValue(query.error)}
          success={firstValue(query.success)}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <ApplicationBody
          application={application}
          careerProfile={careerProfile}
          extendedProfile={extendedProfile}
          skills={skills}
          showCandidateContact
          messages={messages}
          perspective="employer"
        />
        <Card className="h-fit bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Hiring status
            </p>
            <ApplicationStatusBadge
              className="mt-4"
              status={application.status}
            />
            {application.status === "withdrawn" ? (
              <p className="mt-4 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
                The candidate withdrew this application. Its status can no
                longer be changed.
              </p>
            ) : canEdit ? (
              <form action={updateApplicationStatus} className="mt-5 grid gap-3">
                <input
                  name="applicationId"
                  type="hidden"
                  value={application.id}
                />
                <label className="grid gap-2 text-sm font-medium">
                  Update status
                  <select
                    className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-ring focus:ring-3 focus:ring-ring/20"
                    defaultValue={application.status}
                    name="status"
                  >
                    {employerApplicationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit">Save status</Button>
              </form>
            ) : (
              <p className="mt-4 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
                Your workspace role has view-only access to applicant statuses.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployerDashboardShell>
  )
}

function ApplicationHeading({
  application,
  perspective,
}: {
  application: ApplicationRecord
  perspective: "candidate" | "employer"
}) {
  return (
    <div className="mt-6">
      <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">
        {perspective === "candidate" ? "Your application" : "Applicant review"}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
        {perspective === "candidate"
          ? application.job_title
          : `${application.candidate_first_name} ${application.candidate_last_name}`}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {perspective === "candidate"
          ? application.organization_name
          : `Applied for ${application.job_title}`}
      </p>
    </div>
  )
}

function ApplicationBody({
  application,
  careerProfile,
  extendedProfile,
  skills = [],
  showCandidateContact = false,
  messages,
  perspective,
}: {
  application: ApplicationRecord
  careerProfile?: StructuredCareerProfile
  extendedProfile?: ProfessionalProfileRecord | null
  skills?: ProfessionalSkillRecord[]
  showCandidateContact?: boolean
  messages: ApplicationMessage[]
  perspective: "candidate" | "employer"
}) {
  return (
    <div className="grid gap-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>
            {showCandidateContact ? "Candidate profile" : "Application profile"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail
              icon={UserRound}
              label="Candidate"
              value={`${application.candidate_first_name} ${application.candidate_last_name}`}
            />
            <Detail
              icon={Stethoscope}
              label="Profession"
              value={`${application.profession}${
                application.specialty ? ` · ${application.specialty}` : ""
              }`}
            />
            <Detail
              icon={BriefcaseBusiness}
              label="Career stage"
              value={application.career_stage}
            />
            <Detail
              icon={MapPin}
              label="U.S. state"
              value={application.state_code}
            />
            <Detail
              icon={CalendarDays}
              label="Submitted"
              value={formatDate(application.submitted_at)}
            />
          </dl>
          {showCandidateContact && (
            <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
              <Button asChild variant="outline">
                <a href={`mailto:${application.candidate_email}`}>
                  <Mail /> Email candidate
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${application.phone}`}>
                  <Phone /> {application.phone}
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {careerProfile && <CareerProfileSummary profile={careerProfile} />}

      {showCandidateContact && (
        <ExtendedProfileSummary profile={extendedProfile} skills={skills} />
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Message to the hiring team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
            {application.cover_letter}
          </p>
        </CardContent>
      </Card>

      <ApplicationMessages application={application} messages={messages} perspective={perspective} />

      {(application.resume_document_id || application.resume_url) && (
        <Card className="bg-white">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Resume or CV</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {application.resume_document_id
                  ? "Access is granted through this application using a short-lived secure link."
                  : "Open the legacy document link supplied with this application."}
              </p>
            </div>
            {application.resume_document_id ? (
              <Button asChild>
                <Link
                  href={`/dashboard/documents/${application.resume_document_id}/download`}
                >
                  Download secure resume <ExternalLink />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <a
                  href={application.resume_url ?? undefined}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open document <ExternalLink />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

type ApplicationMessage = {
  id: string
  sender_user_id: string
  body: string
  created_at: string
}

async function getApplicationMessages(
  supabase: Awaited<ReturnType<typeof requireIdentity>>["supabase"],
  applicationId: string,
) {
  const { data } = await supabase
    .from("application_messages")
    .select("id, sender_user_id, body, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true })
    .limit(200)

  return (data ?? []) as ApplicationMessage[]
}

function ApplicationMessages({
  application,
  messages,
  perspective,
}: {
  application: ApplicationRecord
  messages: ApplicationMessage[]
  perspective: "candidate" | "employer"
}) {
  const canMessage = application.status !== "withdrawn"

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="size-5 text-primary" />Conversation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">Private messages are visible only to the candidate and authorized hiring team members.</p>
        {messages.length ? (
          <div className="mt-5 grid gap-3">
            {messages.map((message) => {
              const sentByCandidate = message.sender_user_id === application.candidate_id
              const mine = sentByCandidate === (perspective === "candidate")
              return (
                <div className={mine ? "justify-self-end rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground" : "justify-self-start rounded-2xl bg-muted px-4 py-3 text-sm"} key={message.id}>
                  <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                  <p className={mine ? "mt-2 text-xs text-primary-foreground/75" : "mt-2 text-xs text-muted-foreground"}>{sentByCandidate ? "Candidate" : application.organization_name} · {formatDate(message.created_at)}</p>
                </div>
              )
            })}
          </div>
        ) : <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">No messages yet.</p>}
        {canMessage ? (
          <form action={sendApplicationMessage} className="mt-5 grid gap-3 border-t pt-5">
            <input name="applicationId" type="hidden" value={application.id} />
            <label className="grid gap-2 text-sm font-medium">New message<Textarea maxLength={4000} minLength={1} name="body" placeholder="Write a message about this application." required rows={4} /></label>
            <div><Button type="submit">Send message</Button></div>
          </form>
        ) : <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Messaging is closed because this application was withdrawn.</p>}
      </CardContent>
    </Card>
  )
}

function ExtendedProfileSummary({
  profile,
  skills,
}: {
  profile?: ProfessionalProfileRecord | null
  skills: ProfessionalSkillRecord[]
}) {
  if (!profile) {
    return (
      <Card className="bg-white">
        <CardHeader><CardTitle>Extended professional profile</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">The candidate has kept their extended profile private.</p></CardContent>
      </Card>
    )
  }
  return (
    <Card className="bg-white">
      <CardHeader><CardTitle>Extended professional profile</CardTitle></CardHeader>
      <CardContent className="grid gap-5">
        {profile.photo_path && (
          <Image alt="Candidate profile" className="size-24 rounded-2xl object-cover" height={96} src={`/dashboard/profile/photo/${profile.user_id}`} unoptimized width={96} />
        )}
        {profile.headline && <p className="font-semibold">{profile.headline}</p>}
        {profile.biography && <p className="whitespace-pre-wrap leading-7 text-muted-foreground">{profile.biography}</p>}
        <div>
          <h3 className="font-semibold">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.length ? skills.map((skill) => (
              <span className="rounded-full bg-muted px-3 py-1.5 text-sm" key={skill.id}>{skill.name} · {skill.proficiency}</span>
            )) : <span className="text-sm text-muted-foreground">No structured skills added.</span>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Languages</h3>
          <p className="mt-2 text-sm text-muted-foreground">{profile.languages.length ? profile.languages.join(", ") : "No languages added."}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CareerProfileSummary({
  profile,
}: {
  profile: StructuredCareerProfile
}) {
  const hasRecords =
    profile.education.length > 0 ||
    profile.experience.length > 0 ||
    profile.licenses.length > 0 ||
    profile.certifications.length > 0

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Structured career history</CardTitle>
      </CardHeader>
      <CardContent>
        {hasRecords ? (
          <div className="grid gap-6">
            <CareerGroup
              icon={BriefcaseBusiness}
              items={profile.experience.map((record) => ({
                id: record.id,
                title: record.role_title,
                subtitle: `${record.organization_name} · ${careerDateRange(record.start_date, record.end_date, record.is_current)}`,
              }))}
              title="Experience"
            />
            <CareerGroup
              icon={GraduationCap}
              items={profile.education.map((record) => ({
                id: record.id,
                title: `${record.program} — ${record.institution}`,
                subtitle: `${educationTypeLabels[record.education_type]} · ${careerDateRange(record.start_date, record.end_date, record.is_current)}`,
              }))}
              title="Education and training"
            />
            <CareerGroup
              icon={ShieldCheck}
              items={profile.licenses.map((record) => ({
                id: record.id,
                title: record.license_type,
                subtitle: `${record.issuing_state} · License ${record.license_number}${record.expires_on ? ` · Expires ${formatCareerDate(record.expires_on)}` : ""}`,
              }))}
              title="Licenses"
            />
            <CareerGroup
              icon={Award}
              items={profile.certifications.map((record) => ({
                id: record.id,
                title: record.name,
                subtitle: `${record.issuing_organization}${record.expires_on ? ` · Expires ${formatCareerDate(record.expires_on)}` : ""}`,
              }))}
              title="Certifications"
            />
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            The candidate has not added structured career records yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CareerGroup({
  icon: Icon,
  items,
  title,
}: {
  icon: typeof UserRound
  items: { id: string; subtitle: string; title: string }[]
  title: string
}) {
  if (!items.length) {
    return null
  }

  return (
    <section>
      <h3 className="flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      <div className="mt-3 grid gap-3">
        {items.map((item) => (
          <div className="rounded-xl border border-border p-4" key={item.id}>
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function careerDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean,
) {
  const start = startDate ? formatCareerDate(startDate) : "Date not provided"
  return `${start}–${isCurrent ? "Present" : endDate ? formatCareerDate(endDate) : "Not provided"}`
}

function formatCareerDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="mt-1.5 font-semibold">{value}</dd>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      href="/dashboard/applications"
    >
      <ArrowLeft className="size-4" />
      Back to applications
    </Link>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function statusLabel(status: ApplicationStatus) {
  const labels: Record<ApplicationStatus, string> = {
    submitted: "Submitted",
    reviewing: "In review",
    interview: "Interview",
    offer: "Offer",
    rejected: "Not selected",
    withdrawn: "Withdrawn",
  }

  return labels[status]
}
