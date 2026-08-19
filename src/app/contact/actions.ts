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
        html: `<h2>New SM VIA contact message</h2><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Topic:</strong> ${escapeHtml(topic)}</p><hr><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
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
