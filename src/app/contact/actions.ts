"use server"

import { redirect } from "next/navigation"

import { formString, isValidEmail, messagePath } from "@/lib/auth/validation"

const topics = ["General question", "Account support", "Employer support", "Privacy request", "Partnership", "Other"] as const

export async function submitContactMessage(formData: FormData) {
  const name = formString(formData, "name")
  const email = formString(formData, "email")
  const topic = formString(formData, "topic")
  const message = formString(formData, "message")
  const website = formString(formData, "website")

  if (website) {
    redirect(messagePath("/contact", "success", "Thank you. Your message has been received."))
  }

  if (
    name.length < 2 || name.length > 100 || !isValidEmail(email) ||
    !topics.includes(topic as (typeof topics)[number]) ||
    message.length < 20 || message.length > 3000
  ) {
    redirect(messagePath("/contact", "error", "Please complete every required field and provide at least 20 characters."))
  }

  const recipient = process.env.CONTACT_RECIPIENT
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!recipient || !apiKey || !from) {
    redirect(messagePath("/contact", "error", "The contact form is temporarily unavailable. Please try again later."))
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: `[SM VIA contact] ${topic}`,
        text: `New message from the SM VIA contact page\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`,
        html: renderContactEmail({ name, email, topic, message }),
      }),
    })

    if (!response.ok) {
      redirect(messagePath("/contact", "error", "Your message could not be sent. Please try again shortly."))
    }
  } catch {
    redirect(messagePath("/contact", "error", "Your message could not be sent. Please try again shortly."))
  }

  redirect(messagePath("/contact", "success", "Thank you. The SM VIA team received your message."))
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!)
}

function renderContactEmail(input: { name: string; email: string; topic: string; message: string }) {
  const safeName = escapeHtml(input.name)
  const safeEmail = escapeHtml(input.email)
  const safeTopic = escapeHtml(input.topic)
  const safeMessage = escapeHtml(input.message)

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f3f7fa;font-family:Arial,Helvetica,sans-serif;color:#10213c"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">New SM VIA contact message from ${safeName}.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fa"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dbe4ec;border-radius:18px"><tr><td style="padding:32px"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="width:38px;height:38px;border-radius:9px;background:#0b315d;color:#ffffff;text-align:center;font-size:21px;font-weight:700;line-height:38px">+</td><td style="padding-left:11px;font-size:22px;font-weight:700;letter-spacing:0.04em;color:#0b315d">SM VIA</td></tr></table><div style="height:1px;background:#dbe4ec;margin:25px 0 28px"></div><p style="margin:0 0 10px;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0b5cab">New contact request</p><h1 style="margin:0 0 14px;font-size:30px;line-height:38px;letter-spacing:-0.4px;color:#10213c">A visitor sent a message.</h1><p style="margin:0 0 24px;font-size:16px;line-height:26px;color:#3e5068">Reply directly to this email to respond to the sender.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f7fc;border:1px solid #c9e0f3;border-radius:12px"><tr><td style="padding:20px"><p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#53677e">From</p><p style="margin:0 0 15px;font-size:17px;line-height:24px;font-weight:700;color:#10213c">${safeName}</p><p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#53677e">Email</p><p style="margin:0 0 15px;font-size:16px;line-height:22px;color:#0b5cab">${safeEmail}</p><p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#53677e">Topic</p><span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#d6eafc;color:#0b4c8c;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase">${safeTopic}</span></td></tr></table><p style="margin:28px 0 10px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#53677e">Message</p><div style="padding:20px;background:#ffffff;border:1px solid #dbe4ec;border-radius:12px;font-size:16px;line-height:26px;color:#26384f;white-space:pre-wrap">${safeMessage}</div><div style="height:1px;background:#dbe4ec;margin:30px 0 20px"></div><p style="margin:0;font-size:13px;line-height:20px;color:#687a90">This message was submitted through the public SM VIA contact form. Do not forward it outside the team unless necessary to handle the request.</p></td></tr></table></td></tr></table></body></html>`
}
