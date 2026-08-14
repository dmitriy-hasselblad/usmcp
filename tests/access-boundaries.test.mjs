import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8")
}

test("platform-admin route guard requires an active platform-admin record", async () => {
  const source = await readProjectFile("src/lib/admin/session.ts")

  assert.match(source, /from\("platform_admins"\)/)
  assert.match(source, /\.eq\("is_active", true\)/)
  assert.match(source, /if \(error \|\| !access\) \{\s*notFound\(\)/s)
})

test("employer workspace is bound to the profile organization membership", async () => {
  const source = await readProjectFile("src/lib/employer/session.ts")

  assert.match(source, /from\("employer_profiles"\)/)
  assert.match(source, /\.select\("organization_id"\)/)
  assert.match(source, /membershipQuery = membershipQuery\.eq\(\s*"organization_id",\s*employerProfile\.organization_id/s)
  assert.match(source, /if \(!membership\) \{\s*redirect\("\/dashboard\/workspace-unavailable"\)/s)
})

test("employer bootstrap keeps the profile organization link synchronized", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260723172251_employer_workspace.sql",
  )

  assert.match(migration, /update public\.employer_profiles\s+set organization_id = new_organization_id/s)
  assert.match(migration, /where employer_profiles\.user_id = current_user_id/s)
})

test("applications are visible only to their candidate or an authorized hiring team", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260723223554_candidate_applications.sql",
  )
  const updatePolicy = await readProjectFile(
    "supabase/migrations/20260723225443_consolidate_application_update_policy.sql",
  )

  assert.match(migration, /alter table public\.applications enable row level security/)
  assert.match(migration, /candidate_id = \(select auth\.uid\(\)\)[\s\S]*or private\.is_organization_member\(organization_id\)/)
  assert.match(migration, /Professionals can submit applications/)
  assert.match(migration, /candidate_id = \(select auth\.uid\(\)\)[\s\S]*account_type = 'professional'/)
  assert.match(updatePolicy, /Candidates and hiring teams can update application status/)
  assert.match(updatePolicy, /candidate_id = \(select auth\.uid\(\)\)[\s\S]*status = 'withdrawn'/)
})

test("private document and attachment downloads rely on RLS and never cache signed links", async () => {
  const documentsRoute = await readProjectFile(
    "src/app/dashboard/documents/[id]/download/route.ts",
  )
  const attachmentsRoute = await readProjectFile(
    "src/app/dashboard/application-attachments/[id]/download/route.ts",
  )
  const documentsMigration = await readProjectFile(
    "supabase/migrations/20260729092005_professional_profiles_documents.sql",
  )

  assert.match(documentsRoute, /requireIdentity\(/)
  assert.match(documentsRoute, /from\("professional_documents"\)/)
  assert.match(documentsRoute, /createSignedUrl\([^,]+, 60/)
  assert.match(documentsRoute, /Cache-Control": "private, no-store"/)
  assert.doesNotMatch(documentsRoute, /service_role|SUPABASE_SERVICE/i)
  assert.match(attachmentsRoute, /requireIdentity\(/)
  assert.match(attachmentsRoute, /from\("application_message_attachments"\)/)
  assert.match(attachmentsRoute, /createSignedUrl\([^,]+, 60/)
  assert.match(attachmentsRoute, /Cache-Control": "private, no-store"/)
  assert.doesNotMatch(attachmentsRoute, /service_role|SUPABASE_SERVICE/i)
  assert.match(documentsMigration, /Professionals and authorized hiring teams can read documents/)
  assert.match(documentsMigration, /user_id = \(select auth\.uid\(\)\)[\s\S]*applications\.resume_document_id = professional_documents\.id/)
})

test("abuse reports remain private, RLS-protected, and auditable", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260807170000_abuse_reporting_oversight.sql",
  )

  assert.match(migration, /alter table public\.abuse_reports enable row level security/)
  assert.match(migration, /create policy "Reporters can read their abuse reports"[\s\S]*reporter_id = \(select auth\.uid\(\)\)/)
  assert.match(migration, /create policy "Platform admins can read abuse reports"[\s\S]*private\.is_platform_admin\(\)/)
  assert.match(migration, /if \(select auth\.uid\(\)\) is null or not private\.is_platform_admin\(\) then/)
  assert.match(migration, /private\.record_admin_audit_event\(/)
})

test("résumé drafts are private, owner-scoped, and separate from profiles", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260810073202_standalone_resume_builder.sql",
  )
  const builder = await readProjectFile("src/app/dashboard/resumes/page.tsx")

  assert.match(migration, /alter table public\.professional_resumes enable row level security/)
  assert.match(migration, /revoke all on table public\.professional_resumes from public, anon, authenticated/)
  assert.match(migration, /for select[\s\S]*auth\.uid\(\)[\s\S]*user_id/)
  assert.match(migration, /for insert[\s\S]*account_type = 'professional'/)
  assert.doesNotMatch(migration, /hiring|employer|organization_member/i)
  assert.match(builder, /Nothing is copied from your profile/)
})

test("organization news is self-service, reversible, and has private revision history", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260811113447_news_self_service_publishing.sql",
  )
  const dashboard = await readProjectFile("src/app/dashboard/news/page.tsx")

  assert.match(migration, /create table public\.organization_post_revisions/)
  assert.match(migration, /alter table public\.organization_post_revisions enable row level security/)
  assert.match(migration, /revoke all on table public\.organization_post_revisions from public, anon, authenticated/)
  assert.match(migration, /create or replace function public\.save_organization_post/)
  assert.match(migration, /create or replace function public\.archive_organization_post/)
  assert.match(migration, /existing_post\.author_id <> current_user_id and not can_manage_all/)
  assert.match(migration, /revoke insert, update, delete on table public\.organization_posts from authenticated/)
  assert.match(migration, /where status = 'submitted' and moderation_status = 'pending'/)
  assert.match(dashboard, /Edit article/)
  assert.match(dashboard, /Remove from public news/)
})

test("in-product notifications are private and generated by application events", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260811131725_in_product_notifications.sql",
  )

  assert.match(migration, /alter table public\.user_notifications enable row level security/)
  assert.match(migration, /using \(user_id = \(select auth\.uid\(\)\)\)/)
  assert.match(migration, /grant update \(read_at\) on table public\.user_notifications to authenticated/)
  assert.match(migration, /after insert on public\.applications/)
  assert.match(migration, /after update of status on public\.applications/)
})

test("application messages remain private to the candidate and authorized hiring team", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260812052831_application_messaging.sql",
  )

  assert.match(migration, /alter table public\.application_messages enable row level security/)
  assert.match(migration, /candidate_id = \(select auth\.uid\(\)\)/)
  assert.match(migration, /private\.is_organization_member\(/)
  assert.match(migration, /after insert on public\.application_messages/)
  assert.match(migration, /applications\.status <> 'withdrawn'/)
})

test("application message attachments stay private to application participants", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260812104739_application_message_attachments.sql",
  )

  assert.match(migration, /alter table public\.application_message_attachments enable row level security/)
  assert.match(migration, /candidate_id = \(select auth\.uid\(\)\)/)
  assert.match(migration, /private\.is_organization_member\(/)
  assert.match(migration, /'application-message-attachments',\s*false,\s*10485760/s)
  assert.match(migration, /create policy "Application participants can read attachment objects"/)
  assert.match(migration, /after insert on public\.application_message_attachments/)
})

test("application interview scheduling is private and notifies both participants", async () => {
  const migration = await readProjectFile(
    "supabase/migrations/20260812121605_interview_scheduling.sql",
  )

  assert.match(migration, /alter table public\.application_interviews enable row level security/)
  assert.match(migration, /create policy "Application participants can read interviews"/)
  assert.match(migration, /candidate_id = \(select auth\.uid\(\)\)/)
  assert.match(migration, /private\.is_organization_member\(/)
  assert.match(migration, /create or replace function public\.schedule_application_interview/)
  assert.match(migration, /create or replace function public\.respond_to_application_interview/)
  assert.match(migration, /'interview_scheduled'/)
  assert.match(migration, /'interview_response'/)
})

test("video interviews require a confirmed, participant-authorized interview", async () => {
  const page = await readProjectFile("src/app/dashboard/interviews/[id]/video/page.tsx")
  const tokenFactory = await readProjectFile("src/lib/interviews/video.ts")
  const migration = await readProjectFile("supabase/migrations/20260813060548_interview_video_session_expiry.sql")
  const room = await readProjectFile("src/components/interviews/interview-video-room.tsx")

  assert.match(page, /from\("application_interviews"\)/)
  assert.match(page, /interview\.status !== "confirmed"/)
  assert.match(page, /createInterviewVideoToken/)
  assert.match(page, /start_application_interview_video/)
  assert.match(tokenFactory, /ttl: "10m"/)
  assert.match(tokenFactory, /room: `ushce-interview-\$\{interviewId\}`/)
  assert.match(migration, /video_ended_at/)
  assert.match(migration, /interval '5 minutes'/)
  assert.match(migration, /revoke execute on function public\.start_application_interview_video\(uuid\) from public, anon/)
  assert.match(room, /onDisconnected=\{recordDisconnect\}/)
  assert.match(room, /window\.addEventListener\("pagehide", handlePageExit\)/)
  assert.match(room, /<div className="h-\[min\(68vh,44rem\)\] overflow-hidden rounded-xl border">/)
  assert.match(room, /<LiveKitRoom audio className="h-full"/)
})

test("calendar downloads are private and available only for confirmed interviews", async () => {
  const route = await readProjectFile("src/app/dashboard/interviews/[id]/calendar/route.ts")
  const calendar = await readProjectFile("src/lib/interviews/calendar.ts")

  assert.match(route, /from\("application_interviews"\)/)
  assert.match(route, /interview\.status !== "confirmed"/)
  assert.match(route, /Cache-Control": "private, no-store"/)
  assert.match(calendar, /BEGIN:VCALENDAR/)
  assert.match(calendar, /escapeCalendarText/)
})

test("employer hiring insights are scoped to the current organization and aggregate only", async () => {
  const insightsPage = await readProjectFile(
    "src/app/dashboard/insights/page.tsx",
  )
  const insights = await readProjectFile("src/lib/employer/hiring-insights.ts")

  assert.match(insightsPage, /requireEmployerWorkspace\("\/dashboard\/insights"\)/)
  assert.match(insightsPage, /from\("applications"\)/)
  assert.match(insightsPage, /\.eq\("organization_id", workspace\.organization\.id\)/)
  assert.match(insightsPage, /select\("id, candidate_id, job_id, job_title, status, submitted_at"\)/)
  assert.doesNotMatch(insightsPage, /candidate_email|cover_letter|phone|resume_document_id/)
  assert.match(insights, /new Set\([\s\S]*candidate_id/)
  assert.match(insights, /statusCounts/)
})

test("professional application insights are scoped to the signed-in candidate", async () => {
  const insightsPage = await readProjectFile(
    "src/app/dashboard/application-insights/page.tsx",
  )
  const insights = await readProjectFile(
    "src/lib/professional/application-insights.ts",
  )

  assert.match(
    insightsPage,
    /requireIdentity\("\/dashboard\/application-insights"\)/,
  )
  assert.match(insightsPage, /from\("applications"\)/)
  assert.match(insightsPage, /\.eq\("candidate_id", identity\.userId\)/)
  assert.match(
    insightsPage,
    /select\("id, job_title, organization_name, status, submitted_at, updated_at"\)/,
  )
  assert.doesNotMatch(
    insightsPage,
    /candidate_email|cover_letter|phone|resume_document_id/,
  )
  assert.match(insights, /recentActivity/)
  assert.match(insights, /statusCounts/)
})

test("product analytics remains opt-in and excludes personal application data", async () => {
  const tracker = await readProjectFile("src/components/analytics/analytics-link.tsx")
  const heroSearch = await readProjectFile("src/components/marketing/hero-search.tsx")

  assert.match(tracker, /preferences\?\.analytics/)
  assert.match(tracker, /track\(eventName, eventData\)/)
  assert.match(heroSearch, /job_search_submitted/)
  assert.doesNotMatch(tracker, /email|candidate|resume|phone/i)
})
