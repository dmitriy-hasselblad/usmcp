import { notFound } from "next/navigation"

import { requireIdentity } from "@/lib/auth/session"
import { createInterviewCalendarEvent } from "@/lib/interviews/calendar"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [{ id }, identity] = await Promise.all([params, requireIdentity("/dashboard")])
  const { data: interview } = await identity.supabase
    .from("application_interviews")
    .select("id, application_id, starts_at, duration_minutes, interview_format, location_or_link, notes, status")
    .eq("id", id)
    .maybeSingle()

  if (!interview || interview.status !== "confirmed") notFound()

  const { data: application } = await identity.supabase
    .from("applications")
    .select("job_title, organization_name")
    .eq("id", interview.application_id)
    .maybeSingle()

  if (!application) notFound()

  const calendarEvent = createInterviewCalendarEvent({
    id: interview.id,
    startsAt: interview.starts_at,
    durationMinutes: interview.duration_minutes,
    title: application.job_title,
    organizationName: application.organization_name,
    format: interview.interview_format,
    locationOrLink: interview.location_or_link,
    notes: interview.notes,
  })

  return new Response(calendarEvent, {
    headers: {
      "Content-Disposition": `attachment; filename="ushce-interview-${interview.id}.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  })
}
