import "server-only"

import type { ApplicationStatus } from "@/lib/applications/constants"

type DeliveryMode = "disabled" | "test" | "live"

type ApplicationStatusEmail = {
  applicationId: string
  candidateEmail: string
  candidateFirstName: string
  jobTitle: string
  organizationName: string
  status: ApplicationStatus
  updatedAt: string
}

export type EmailDeliveryResult =
  | { outcome: "sent" }
  | { outcome: "skipped"; code: string }
  | { outcome: "failed"; code: string }

const statusCopy: Record<ApplicationStatus, { label: string; message: string }> = {
  submitted: { label: "Submitted", message: "Your application is now marked as submitted." },
  reviewing: { label: "Under review", message: "The hiring team is reviewing your application." },
  interview: { label: "Interview", message: "The hiring team moved your application to the interview stage." },
  offer: { label: "Offer", message: "The hiring team moved your application to the offer stage." },
  rejected: { label: "Not selected", message: "The hiring team has completed its review and did not select this application." },
  withdrawn: { label: "Withdrawn", message: "This application has been withdrawn." },
}

export async function sendApplicationStatusEmail(input: ApplicationStatusEmail): Promise<EmailDeliveryResult> {
  const mode = getDeliveryMode()
  if (mode === "disabled") return { outcome: "skipped", code: "delivery_disabled" }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT
  if (!apiKey || !from) return { outcome: "skipped", code: "missing_email_configuration" }
  if (mode === "test" && !testRecipient) return { outcome: "skipped", code: "missing_test_recipient" }

  const recipient = mode === "test" ? testRecipient! : input.candidateEmail
  if (!isEmail(recipient)) return { outcome: "failed", code: "invalid_recipient" }

  const applicationUrl = `${getApplicationOrigin()}/dashboard/applications/${input.applicationId}`
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `application-status-${input.applicationId}-${input.status}-${input.updatedAt.replace(/[^0-9]/g, "")}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `Application update: ${input.jobTitle}`,
        html: renderHtml(input, applicationUrl),
        text: renderText(input, applicationUrl),
      }),
    })
    if (!response.ok) return { outcome: "failed", code: `provider_${response.status}` }
    return { outcome: "sent" }
  } catch {
    return { outcome: "failed", code: "provider_unreachable" }
  }
}

function getDeliveryMode(): DeliveryMode {
  const value = process.env.EMAIL_DELIVERY_MODE
  return value === "test" || value === "live" ? value : "disabled"
}

function getApplicationOrigin() {
  const vercelUrl = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").origin }
  catch { return "http://localhost:3000" }
}

function renderHtml(input: ApplicationStatusEmail, applicationUrl: string) {
  const copy = statusCopy[input.status]
  return `<!doctype html><html><body style="margin:0;background:#f4f8fb;font-family:Arial,sans-serif;color:#0f172a"><div style="display:none;max-height:0;overflow:hidden">Your USHCE application status is now ${escapeHtml(copy.label)}.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #dbe5ec;border-radius:18px"><tr><td style="padding:32px"><div style="font-size:20px;font-weight:700;color:#0f4c81">USHCE</div><p style="margin:28px 0 8px;font-size:16px">Hello ${escapeHtml(input.candidateFirstName)},</p><h1 style="margin:0 0 16px;font-size:28px;line-height:1.2">Your application status changed</h1><p style="margin:0 0 20px;font-size:16px;line-height:1.6">${escapeHtml(copy.message)}</p><div style="padding:18px;background:#f0f6fa;border-radius:12px"><strong>${escapeHtml(input.jobTitle)}</strong><br><span style="color:#526273">${escapeHtml(input.organizationName)}</span><br><span style="color:#0f4c81;font-weight:700">${escapeHtml(copy.label)}</span></div><p style="margin:28px 0"><a href="${escapeHtml(applicationUrl)}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#0f4c81;color:#fff;text-decoration:none;font-weight:700">View application</a></p><p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.5">This transactional email was sent because you applied for this role through USHCE.</p></td></tr></table></td></tr></table></body></html>`
}

function renderText(input: ApplicationStatusEmail, applicationUrl: string) {
  const copy = statusCopy[input.status]
  return `Hello ${input.candidateFirstName},\n\n${copy.message}\n\n${input.jobTitle}\n${input.organizationName}\nStatus: ${copy.label}\n\nView application: ${applicationUrl}\n\nThis transactional email was sent because you applied for this role through USHCE.`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!)
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
