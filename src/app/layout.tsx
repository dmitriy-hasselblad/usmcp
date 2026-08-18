import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { CookieConsentProvider } from "@/components/privacy/cookie-consent-provider"
import { ConsentAwareAnalytics } from "@/components/privacy/consent-aware-analytics"
import { getSiteUrl } from "@/lib/seo"

import "./globals.css"
import "@livekit/components-styles"

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
    default: "SMVIA | The U.S. Healthcare Career Ecosystem",
    template: "%s | SMVIA",
  },
  description:
    "SMVIA connects healthcare professionals with meaningful opportunities, trusted organizations, and practical career guidance.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SMVIA",
    title: "SMVIA | The U.S. Healthcare Career Ecosystem",
    description:
      "Healthcare opportunities, trusted organizations, and practical career guidance for the United States.",
  },
  twitter: {
    card: "summary",
    title: "SMVIA | The U.S. Healthcare Career Ecosystem",
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
        <CookieConsentProvider>
          {children}
          <ConsentAwareAnalytics />
        </CookieConsentProvider>
      </body>
    </html>
  )
}
