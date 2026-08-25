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
  cancelApplicationInterview,
  markApplicationHired,
  respondToApplicationInterview,
  scheduleApplicationInterview,
  sendApplicationMessage,
  updateApplicationStatus,
  withdrawApplication,
} from "@/app/applications/actions"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { MessageAttachmentUpload } from "@/components/applications/message-attachment-upload"
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
  description: "Review a healthcare job application in SM VIA.",
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
  await markApplicationNotificationsRead(identity.supabase, identity.userId, application.id)
  const [messages, attachments, interviews] = await Promise.all([getApplicationMessages(identity.supabase, application.id), getApplicationAttachments(identity.supabase, application.id), getApplicationInterviews(identity.supabase, application.id)])

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
        <ApplicationBody application={application} interviews={interviews} messages={messages} attachments={attachments} perspective="candidate" userId={identity.userId} />
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
  await markApplicationNotificationsRead(workspace.supabase, workspace.userId, application.id)
  const [messages, attachments, interviews] = await Promise.all([getApplicationMessages(workspace.supabase, application.id), getApplicationAttachments(workspace.supabase, application.id), getApplicationInterviews(workspace.supabase, application.id)])
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
          attachments={attachments}
          interviews={interviews}
          perspective="employer"
          userId={workspace.userId}
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
            ) : application.status === "hired" ? (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                This candidate has been marked as hired. The job&apos;s remaining
                open-position count has been updated.
              </p>
            ) : canEdit ? (
              <div className="mt-5 grid gap-3">
                <form action={updateApplicationStatus} className="grid gap-3">
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
                <form action={markApplicationHired}>
                  <input name="applicationId" type="hidden" value={application.id} />
                  <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                    Confirm this only after the candidate accepts. One open
                    position will be removed. When no positions remain, this
                    job will close and move to your archived jobs.
                  </p>
                  <Button className="w-full" type="submit">
                    Mark as hired
                  </Button>
                </form>
                <p className="text-xs leading-5 text-muted-foreground">
                  This notifies the candidate and platform administrator.
                </p>
              </div>
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
  attachments,
  interviews,
  perspective,
  userId,
}: {
  application: ApplicationRecord
  careerProfile?: StructuredCareerProfile
  extendedProfile?: ProfessionalProfileRecord | null
  skills?: ProfessionalSkillRecord[]
  showCandidateContact?: boolean
  messages: ApplicationMessage[]
  attachments: ApplicationAttachment[]
  interviews: ApplicationInterview[]
  perspective: "candidate" | "employer"
  userId: string
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

      <ApplicationMessages application={application} messages={messages} attachments={attachments} perspective={perspective} userId={userId} />

      <ApplicationInterviews application={application} interviews={interviews} perspective={perspective} />

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
type ApplicationAttachment = { id: string; file_name: string; file_size: number; uploaded_by: string; created_at: string }
type ApplicationInterview = { id: string; starts_at: string; time_zone: string; duration_minutes: number; interview_format: "video" | "phone" | "on_site"; location_or_link: string | null; notes: string | null; status: "proposed" | "confirmed" | "declined" | "cancelled"; created_at: string }

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

async function getApplicationAttachments(supabase: Awaited<ReturnType<typeof requireIdentity>>["supabase"], applicationId: string) {
  const { data } = await supabase.from("application_message_attachments").select("id, file_name, file_size, uploaded_by, created_at").eq("application_id", applicationId).order("created_at", { ascending: true })
  return (data ?? []) as ApplicationAttachment[]
}

async function getApplicationInterviews(supabase: Awaited<ReturnType<typeof requireIdentity>>["supabase"], applicationId: string) {
  const { data } = await supabase.from("application_interviews").select("id, starts_at, time_zone, duration_minutes, interview_format, location_or_link, notes, status, created_at").eq("application_id", applicationId).order("starts_at", { ascending: true })
  return (data ?? []) as ApplicationInterview[]
}

async function markApplicationNotificationsRead(
  supabase: Awaited<ReturnType<typeof requireIdentity>>["supabase"],
  userId: string,
  applicationId: string,
) {
  await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("href", `/dashboard/applications/${applicationId}`)
    .is("read_at", null)
}

function ApplicationMessages({
  application,
  messages,
  attachments,
  perspective,
  userId,
}: {
  application: ApplicationRecord
  messages: ApplicationMessage[]
  attachments: ApplicationAttachment[]
  perspective: "candidate" | "employer"
  userId: string
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
        {canMessage && <div className="mt-4 border-t pt-4"><p className="mb-2 text-sm font-medium">Attachment</p><MessageAttachmentUpload applicationId={application.id} userId={userId} /><p className="mt-2 text-xs text-muted-foreground">Private to this application. PDF, DOCX, JPG, or PNG up to 10 MB.</p></div>}
        {attachments.length > 0 && <div className="mt-4 grid gap-2 border-t pt-4">{attachments.map((attachment) => <a className="text-sm font-medium text-primary hover:underline" href={`/dashboard/application-attachments/${attachment.id}/download`} key={attachment.id}>Download {attachment.file_name} · {Math.ceil(attachment.file_size / 1024)} KB</a>)}</div>}
      </CardContent>
    </Card>
  )
}

function ApplicationInterviews({ application, interviews, perspective }: { application: ApplicationRecord; interviews: ApplicationInterview[]; perspective: "candidate" | "employer" }) {
  const activeInterviews = interviews.filter((interview) => interview.status !== "cancelled")
  const canSchedule = perspective === "employer" && application.status !== "withdrawn"

  return <Card className="bg-white">
    <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-5 text-primary" />Interviews</CardTitle></CardHeader>
    <CardContent>
      <p className="text-sm leading-6 text-muted-foreground">Interview invitations are private to this application. Confirmed interviews can be added to any calendar that supports .ics files.</p>
      {activeInterviews.length ? <div className="mt-5 grid gap-4">{activeInterviews.map((interview) => <InterviewCard application={application} interview={interview} key={interview.id} perspective={perspective} />)}</div> : <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">No interview invitations yet.</p>}
      {canSchedule && <form action={scheduleApplicationInterview} className="mt-5 grid gap-4 border-t pt-5">
        <input name="applicationId" type="hidden" value={application.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">Date and time<input className="h-11 rounded-lg border border-input bg-background px-3 text-sm" name="startsAt" required type="datetime-local" /></label>
          <label className="grid gap-2 text-sm font-medium">Time zone<select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" defaultValue="America/New_York" name="timeZone"><option value="America/New_York">Eastern Time</option><option value="America/Chicago">Central Time</option><option value="America/Denver">Mountain Time</option><option value="America/Los_Angeles">Pacific Time</option><option value="Pacific/Honolulu">Hawaii Time</option><option value="America/Anchorage">Alaska Time</option></select></label>
          <label className="grid gap-2 text-sm font-medium">Format<select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" name="interviewFormat"><option value="video">Video interview</option><option value="phone">Phone interview</option><option value="on_site">On-site interview</option></select></label>
          <label className="grid gap-2 text-sm font-medium">Duration<select className="h-11 rounded-lg border border-input bg-background px-3 text-sm" defaultValue="30" name="durationMinutes"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option></select></label>
        </div>
        <label className="grid gap-2 text-sm font-medium">Meeting link or location <span className="font-normal text-muted-foreground">(optional)</span><input className="h-11 rounded-lg border border-input bg-background px-3 text-sm" maxLength={500} name="locationOrLink" placeholder="Video link or on-site address" /></label>
        <label className="grid gap-2 text-sm font-medium">Note for the candidate <span className="font-normal text-muted-foreground">(optional)</span><Textarea maxLength={2000} name="notes" placeholder="Share preparation details or who the candidate will meet." rows={3} /></label>
        <div><Button type="submit">Send interview invitation</Button></div>
      </form>}
    </CardContent>
  </Card>
}

function InterviewCard({ application, interview, perspective }: { application: ApplicationRecord; interview: ApplicationInterview; perspective: "candidate" | "employer" }) {
  const formatLabels = { video: "Video interview", phone: "Phone interview", on_site: "On-site interview" }
  const statusLabels = { proposed: "Awaiting your response", confirmed: "Confirmed", declined: "Declined", cancelled: "Cancelled" }
  return <div className="rounded-xl border border-border p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{formatLabels[interview.interview_format]}</p><p className="mt-1 text-sm text-muted-foreground">{formatInterviewDate(interview.starts_at, interview.time_zone)} · {interview.duration_minutes} minutes</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{statusLabels[interview.status]}</span></div>
    {interview.location_or_link && <p className="mt-3 text-sm"><span className="font-medium">Location or link: </span>{interview.location_or_link}</p>}
    {interview.notes && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{interview.notes}</p>}
    {perspective === "candidate" && interview.status === "proposed" && <div className="mt-4 flex flex-wrap gap-2"><form action={respondToApplicationInterview}><input name="interviewId" type="hidden" value={interview.id} /><input name="applicationId" type="hidden" value={application.id} /><input name="status" type="hidden" value="confirmed" /><Button size="sm" type="submit">Confirm interview</Button></form><form action={respondToApplicationInterview}><input name="interviewId" type="hidden" value={interview.id} /><input name="applicationId" type="hidden" value={application.id} /><input name="status" type="hidden" value="declined" /><Button size="sm" type="submit" variant="outline">Decline</Button></form></div>}
    {interview.status === "confirmed" && <div className="mt-4 flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><a href={`/dashboard/interviews/${interview.id}/calendar`}>Add to calendar</a></Button>{interview.interview_format === "video" && <Button asChild size="sm"><Link href={`/dashboard/interviews/${interview.id}/video`}>Join video interview</Link></Button>}</div>}
    {perspective === "employer" && (interview.status === "proposed" || interview.status === "confirmed") && <form action={cancelApplicationInterview} className="mt-4"><input name="interviewId" type="hidden" value={interview.id} /><input name="applicationId" type="hidden" value={application.id} /><Button size="sm" type="submit" variant="outline">Cancel interview</Button></form>}
  </div>
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

function formatInterviewDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(value))
}

function statusLabel(status: ApplicationStatus) {
  const labels: Record<ApplicationStatus, string> = {
    submitted: "Submitted",
    reviewing: "In review",
    interview: "Interview",
    offer: "Offer",
    hired: "Hired",
    rejected: "Not selected",
    withdrawn: "Withdrawn",
  }

  return labels[status]
}
