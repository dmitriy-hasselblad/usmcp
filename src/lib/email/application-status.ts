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

type MessageNotificationEmail = {
  applicationId: string
  candidateEmail: string
  candidateFirstName: string
  organizationName: string
}

type HiringNotificationEmail = {
  applicationId: string
  candidateFirstName: string
  candidateLastName: string
  jobTitle: string
  organizationName: string
  remainingOpenPositions: number
}

type ApplicationReceivedEmail = {
  applicationId: string
  candidateFirstName: string
  candidateLastName: string
  jobTitle: string
  organizationName: string
  recipients: Array<{
    email: string
    firstName: string | null
  }>
}

type JobSearchMatchEmail = {
  savedSearchId: string
  searchName: string
  candidateEmail: string
  candidateFirstName: string
  jobTitle: string
  organizationName: string
  jobSlug: string
  publishedAt: string
}

const statusCopy: Record<ApplicationStatus, { label: string; message: string }> = {
  submitted: { label: "Submitted", message: "Your application is now marked as submitted." },
  reviewing: { label: "Under review", message: "The hiring team is reviewing your application." },
  interview: { label: "Interview", message: "The hiring team moved your application to the interview stage." },
  offer: { label: "Offer", message: "The hiring team moved your application to the offer stage." },
  hired: { label: "Hired", message: "The hiring team has marked your application as hired. Congratulations on your new role." },
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

  const applicationUrl = `${getApplicationOrigin(mode)}/dashboard/applications/${input.applicationId}`
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

export async function sendNewEmployerMessageEmail(input: MessageNotificationEmail): Promise<EmailDeliveryResult> {
  const mode = getDeliveryMode()
  if (mode === "disabled") return { outcome: "skipped", code: "delivery_disabled" }
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT
  if (!apiKey || !from) return { outcome: "skipped", code: "missing_email_configuration" }
  if (mode === "test" && !testRecipient) return { outcome: "skipped", code: "missing_test_recipient" }

  const recipient = mode === "test" ? testRecipient! : input.candidateEmail
  if (!isEmail(recipient)) return { outcome: "failed", code: "invalid_recipient" }

  const applicationUrl = `${getApplicationOrigin(mode)}/dashboard/applications/${input.applicationId}`
  const subject = "You have a new message from SM VIA"
  const text = `Hello ${input.candidateFirstName},\n\nYou have a new message from ${input.organizationName} through SM VIA. Please sign in to your profile to read and reply.\n\nView your application: ${applicationUrl}`
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `application-message-${input.applicationId}-${Date.now()}` },
      body: JSON.stringify({ from, to: [recipient], subject, text, html: renderNewMessageHtml(input, applicationUrl) }),
    })
    return response.ok ? { outcome: "sent" } : { outcome: "failed", code: `provider_${response.status}` }
  } catch {
    return { outcome: "failed", code: "provider_unreachable" }
  }
}

export async function sendHiringNotificationEmail(input: HiringNotificationEmail): Promise<EmailDeliveryResult> {
  const mode = getDeliveryMode()
  if (mode === "disabled") return { outcome: "skipped", code: "delivery_disabled" }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT
  if (!apiKey || !from) return { outcome: "skipped", code: "missing_email_configuration" }
  if (mode === "test" && !testRecipient) return { outcome: "skipped", code: "missing_test_recipient" }

  const recipient = mode === "test"
    ? testRecipient!
    : (process.env.PLATFORM_ADMIN_EMAIL ?? "admin@smvia.org")
  if (!isEmail(recipient)) return { outcome: "failed", code: "invalid_recipient" }

  const adminUrl = `${getApplicationOrigin(mode)}/admin/applications`
  const candidateName = `${input.candidateFirstName} ${input.candidateLastName}`.trim()
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `application-hired-admin-${input.applicationId}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `Hiring update: ${candidateName} hired for ${input.jobTitle}`,
        html: renderEmailShell({
          preview: `${candidateName} was hired for ${input.jobTitle}.`,
          greeting: "Hello platform administrator,",
          heading: "A candidate was hired",
          message: `<strong>${escapeHtml(candidateName)}</strong> was marked as hired by <strong>${escapeHtml(input.organizationName)}</strong>. ${input.remainingOpenPositions} ${input.remainingOpenPositions === 1 ? "opening remains" : "openings remain"} for this role.`,
          detailTitle: escapeHtml(input.jobTitle),
          detailSubtitle: escapeHtml(input.organizationName),
          badge: "Hiring recorded",
          actionUrl: adminUrl,
          actionLabel: "Review applications",
        }),
        text: `${candidateName} was marked as hired by ${input.organizationName} for ${input.jobTitle}. ${input.remainingOpenPositions} open positions remain. Review applications: ${adminUrl}`,
      }),
    })
    return response.ok
      ? { outcome: "sent" }
      : { outcome: "failed", code: `provider_${response.status}` }
  } catch {
    return { outcome: "failed", code: "provider_unreachable" }
  }
}

/** Sends one private, branded notification to each authorized hiring-team member. */
export async function sendApplicationReceivedEmail(input: ApplicationReceivedEmail): Promise<EmailDeliveryResult> {
  const mode = getDeliveryMode()
  if (mode === "disabled") return { outcome: "skipped", code: "delivery_disabled" }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT
  if (!apiKey || !from) return { outcome: "skipped", code: "missing_email_configuration" }
  if (mode === "test" && !testRecipient) return { outcome: "skipped", code: "missing_test_recipient" }

  const recipients = mode === "test"
    ? [{ email: testRecipient!, firstName: "there" }]
    : [...new Map(input.recipients.filter((recipient) => isEmail(recipient.email)).map((recipient) => [recipient.email.toLowerCase(), recipient])).values()]

  if (!recipients.length) return { outcome: "skipped", code: "no_hiring_team_recipients" }

  const applicationUrl = `${getApplicationOrigin(mode)}/dashboard/applications/${input.applicationId}`
  const candidateName = `${input.candidateFirstName} ${input.candidateLastName}`.trim()
  const deliveries = await Promise.all(
    recipients.map(async (recipient) => {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `application-received-${input.applicationId}-${recipient.email.toLowerCase()}`,
          },
          body: JSON.stringify({
            from,
            to: [recipient.email],
            subject: `New application: ${input.jobTitle}`,
            html: renderEmailShell({
              preview: `${candidateName} applied for ${input.jobTitle}.`,
              greeting: `Hello ${escapeHtml(recipient.firstName ?? "there")},`,
              heading: "A new candidate applied",
              message: `<strong>${escapeHtml(candidateName)}</strong> submitted an application for <strong>${escapeHtml(input.jobTitle)}</strong> at ${escapeHtml(input.organizationName)}. Sign in to review the profile, selected documents, and application message securely.`,
              detailTitle: escapeHtml(input.jobTitle),
              detailSubtitle: escapeHtml(input.organizationName),
              badge: "New application",
              actionUrl: applicationUrl,
              actionLabel: "Review application",
              footer: "This transactional email was sent because you are an authorized member of a hiring team on SM VIA.",
            }),
            text: `Hello ${recipient.firstName ?? "there"},\n\n${candidateName} submitted an application for ${input.jobTitle} at ${input.organizationName}. Sign in to review the candidate's profile, selected documents, and application message.\n\nReview application: ${applicationUrl}\n\nThis transactional email was sent because you are an authorized member of a hiring team on SM VIA.`,
          }),
        })
        return response.ok
          ? { outcome: "sent" as const }
          : { outcome: "failed" as const, code: `provider_${response.status}` }
      } catch {
        return { outcome: "failed" as const, code: "provider_unreachable" }
      }
    }),
  )

  const failed = deliveries.find((delivery) => delivery.outcome === "failed")
  if (failed && deliveries.every((delivery) => delivery.outcome === "failed")) return failed
  return { outcome: "sent" }
}

export async function sendJobSearchMatchEmail(input: JobSearchMatchEmail): Promise<EmailDeliveryResult> {
  const mode = getDeliveryMode()
  if (mode === "disabled") return { outcome: "skipped", code: "delivery_disabled" }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT
  if (!apiKey || !from) return { outcome: "skipped", code: "missing_email_configuration" }
  if (mode === "test" && !testRecipient) return { outcome: "skipped", code: "missing_test_recipient" }

  const recipient = mode === "test" ? testRecipient! : input.candidateEmail
  if (!isEmail(recipient)) return { outcome: "failed", code: "invalid_recipient" }

  const jobUrl = `${getApplicationOrigin(mode)}/jobs/${input.jobSlug}`
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `job-alert-${input.savedSearchId}-${input.jobSlug}-${input.publishedAt.replace(/[^0-9]/g, "")}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `New job match: ${input.jobTitle}`,
        html: renderEmailShell({
          preview: `${input.jobTitle} at ${input.organizationName} matches your saved search.`,
          greeting: `Hello ${escapeHtml(input.candidateFirstName)},`,
          heading: "A new job matches your search",
          message: `<strong>${escapeHtml(input.jobTitle)}</strong> at <strong>${escapeHtml(input.organizationName)}</strong> matches your saved search, “${escapeHtml(input.searchName)}”.`,
          detailTitle: escapeHtml(input.jobTitle),
          detailSubtitle: escapeHtml(input.organizationName),
          badge: "New match",
          actionUrl: jobUrl,
          actionLabel: "View job",
          footer: "You received this email because email alerts are enabled for this saved search. You can change or remove alerts in your SM VIA Job alerts settings.",
        }),
        text: `Hello ${input.candidateFirstName},\n\n${input.jobTitle} at ${input.organizationName} matches your saved search, “${input.searchName}”.\n\nView job: ${jobUrl}\n\nYou received this email because email alerts are enabled for this saved search. Change or remove alerts in your SM VIA Job alerts settings.`,
      }),
    })
    return response.ok ? { outcome: "sent" } : { outcome: "failed", code: `provider_${response.status}` }
  } catch {
    return { outcome: "failed", code: "provider_unreachable" }
  }
}

function getDeliveryMode(): DeliveryMode {
  const value = process.env.EMAIL_DELIVERY_MODE
  return value === "test" || value === "live" ? value : "disabled"
}

function getApplicationOrigin(mode: DeliveryMode) {
  const previewUrl = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL
  if (mode === "test" && previewUrl) return `https://${previewUrl}`
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").origin }
  catch { return previewUrl ? `https://${previewUrl}` : "http://localhost:3000" }
}

function renderHtml(input: ApplicationStatusEmail, applicationUrl: string) {
  const copy = statusCopy[input.status]
  return renderEmailShell({
    preview: `Your SM VIA application status is now ${copy.label}.`,
    greeting: `Hello ${escapeHtml(input.candidateFirstName)},`,
    heading: "Your application status changed",
    message: escapeHtml(copy.message),
    detailTitle: escapeHtml(input.jobTitle),
    detailSubtitle: escapeHtml(input.organizationName),
    badge: escapeHtml(copy.label),
    actionUrl: applicationUrl,
    actionLabel: "View application",
  })
}

function renderNewMessageHtml(input: MessageNotificationEmail, applicationUrl: string) {
  return renderEmailShell({
    preview: `You have a new message from ${input.organizationName} through SM VIA.`,
    greeting: `Hello ${escapeHtml(input.candidateFirstName)},`,
    heading: "You have a new message",
    message: `A hiring team at <strong>${escapeHtml(input.organizationName)}</strong> sent you a message about your application. Sign in to read and reply securely.`,
    detailTitle: "Application conversation",
    detailSubtitle: escapeHtml(input.organizationName),
    badge: "New message",
    actionUrl: applicationUrl,
    actionLabel: "View message",
  })
}

type EmailShellInput = {
  preview: string
  greeting: string
  heading: string
  message: string
  detailTitle: string
  detailSubtitle: string
  badge: string
  actionUrl: string
  actionLabel: string
  footer?: string
}

function renderEmailShell(input: EmailShellInput) {
  const footer = input.footer ?? "This transactional email was sent because you have an active application through SM VIA."
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f3f7fa;font-family:Arial,Helvetica,sans-serif;color:#10213c"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${input.preview}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fa"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dbe4ec;border-radius:18px"><tr><td style="padding:32px"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="width:38px;height:38px;border-radius:9px;background:#0b315d;color:#ffffff;text-align:center;font-size:21px;font-weight:700;line-height:38px">+</td><td style="padding-left:11px;font-size:22px;font-weight:700;letter-spacing:0.04em;color:#0b315d">SM VIA</td></tr></table><div style="height:1px;background:#dbe4ec;margin:25px 0 28px"></div><p style="margin:0 0 10px;font-size:16px;line-height:24px;color:#3e5068">${input.greeting}</p><h1 style="margin:0 0 14px;font-size:30px;line-height:38px;letter-spacing:-0.4px;color:#10213c">${input.heading}</h1><p style="margin:0 0 24px;font-size:16px;line-height:26px;color:#3e5068">${input.message}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f7fc;border:1px solid #c9e0f3;border-radius:12px"><tr><td style="padding:20px"><p style="margin:0 0 7px;font-size:17px;line-height:24px;font-weight:700;color:#10213c">${input.detailTitle}</p><p style="margin:0 0 13px;font-size:15px;line-height:22px;color:#53677e">${input.detailSubtitle}</p><span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#d6eafc;color:#0b4c8c;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase">${input.badge}</span></td></tr></table><table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 0"><tr><td style="border-radius:10px;background:#0b5cab"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;padding:14px 22px;border-radius:10px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none">${input.actionLabel}</a></td></tr></table><div style="height:1px;background:#dbe4ec;margin:30px 0 20px"></div><p style="margin:0;font-size:13px;line-height:20px;color:#687a90">${escapeHtml(footer)}</p></td></tr></table></td></tr></table></body></html>`
}

function renderText(input: ApplicationStatusEmail, applicationUrl: string) {
  const copy = statusCopy[input.status]
  return `Hello ${input.candidateFirstName},\n\n${copy.message}\n\n${input.jobTitle}\n${input.organizationName}\nStatus: ${copy.label}\n\nView application: ${applicationUrl}\n\nThis transactional email was sent because you applied for this role through SM VIA.`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!)
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
