type CalendarInterview = {
  id: string
  startsAt: string
  durationMinutes: number
  title: string
  organizationName: string
  format: "video" | "phone" | "on_site"
  locationOrLink: string | null
  notes: string | null
}

function escapeCalendarText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replace(/\r?\n/g, "\\n")
}

function toUtcCalendarDate(value: Date) {
  return value.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}/, "")
}

export function createInterviewCalendarEvent(interview: CalendarInterview) {
  const start = new Date(interview.startsAt)
  const end = new Date(start.getTime() + interview.durationMinutes * 60_000)
  const formatLabel = {
    video: "Video interview",
    phone: "Phone interview",
    on_site: "On-site interview",
  }[interview.format]
  const description = [
    `${formatLabel} for ${interview.title} at ${interview.organizationName}.`,
    interview.notes,
  ].filter(Boolean).join("\n\n")

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SM VIA//Interview Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:ushce-interview-${interview.id}@usmcp.vercel.app`,
    `DTSTAMP:${toUtcCalendarDate(new Date())}`,
    `DTSTART:${toUtcCalendarDate(start)}`,
    `DTEND:${toUtcCalendarDate(end)}`,
    `SUMMARY:${escapeCalendarText(`${formatLabel}: ${interview.title}`)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    ...(interview.locationOrLink ? [`LOCATION:${escapeCalendarText(interview.locationOrLink)}`] : []),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n")
}
