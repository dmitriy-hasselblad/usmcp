export type CoverLetterContent = {
  fullName: string; credentials: string; cityStateZip: string; phone: string; email: string; linkedin: string
  date: string; recipientName: string; recipientTitle: string; organizationName: string; organizationAddress: string
  subject: string; greeting: string; opening: string; body: string; closing: string; signature: string
}

export const emptyCoverLetterContent: CoverLetterContent = {
  fullName: "", credentials: "", cityStateZip: "", phone: "", email: "", linkedin: "", date: "",
  recipientName: "", recipientTitle: "", organizationName: "", organizationAddress: "", subject: "",
  greeting: "Dear Hiring Manager,", opening: "", body: "", closing: "", signature: "",
}

const text = (value: unknown, maximum: number) => typeof value === "string" ? value.trim().slice(0, maximum) : ""

export function parseCoverLetterContent(value: unknown): CoverLetterContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyCoverLetterContent
  const item = value as Record<string, unknown>
  return {
    fullName: text(item.fullName, 120), credentials: text(item.credentials, 80), cityStateZip: text(item.cityStateZip, 120), phone: text(item.phone, 30), email: text(item.email, 160), linkedin: text(item.linkedin, 300),
    date: text(item.date, 50), recipientName: text(item.recipientName, 120), recipientTitle: text(item.recipientTitle, 120), organizationName: text(item.organizationName, 160), organizationAddress: text(item.organizationAddress, 300),
    subject: text(item.subject, 180), greeting: text(item.greeting, 120), opening: text(item.opening, 2500), body: text(item.body, 6000), closing: text(item.closing, 2500), signature: text(item.signature, 120),
  }
}
