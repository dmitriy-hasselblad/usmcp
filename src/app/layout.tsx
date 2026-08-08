import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { CookieConsentProvider } from "@/components/privacy/cookie-consent-provider"
import { getSiteUrl } from "@/lib/seo"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "USHCE | The U.S. Healthcare Career Ecosystem",
    template: "%s | USHCE",
  },
  description:
    "USHCE connects healthcare professionals with meaningful opportunities, trusted organizations, and practical career guidance.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "USHCE",
    title: "USHCE | The U.S. Healthcare Career Ecosystem",
    description:
      "Healthcare opportunities, trusted organizations, and practical career guidance for the United States.",
  },
  twitter: {
    card: "summary",
    title: "USHCE | The U.S. Healthcare Career Ecosystem",
    description:
      "Healthcare opportunities, trusted organizations, and practical career guidance for the United States.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <CookieConsentProvider>{children}</CookieConsentProvider>
      </body>
    </html>
  )
}
