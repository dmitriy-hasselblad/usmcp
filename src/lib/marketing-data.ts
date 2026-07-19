import type { LucideIcon } from "lucide-react"
import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HeartPulse,
  Landmark,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react"

export type Job = {
  title: string
  employer: string
  location: string
  salary: string
  type: string
  specialty: string
  visa?: boolean
}

export const popularSpecialties = [
  "Cardiology",
  "Internal Medicine",
  "Emergency Medicine",
  "Radiology",
  "Pediatrics",
  "Nursing",
]

export const careerPaths: Array<{
  title: string
  description: string
  icon: LucideIcon
  href: string
}> = [
  {
    title: "Find a role",
    description: "Explore positions from trusted healthcare organizations.",
    icon: Stethoscope,
    href: "#featured-jobs",
  },
  {
    title: "Grow your team",
    description: "Reach qualified clinicians and healthcare professionals.",
    icon: Building2,
    href: "#employers",
  },
  {
    title: "Plan your training",
    description: "Navigate residency, fellowship, and career milestones.",
    icon: GraduationCap,
    href: "#resources",
  },
  {
    title: "Find visa support",
    description: "See opportunities designed for international professionals.",
    icon: Landmark,
    href: "#featured-jobs",
  },
]

export const featuredJobs: Job[] = [
  {
    title: "Emergency Medicine Physician",
    employer: "Harborview Health Network",
    location: "Boston, Massachusetts",
    salary: "$320k–$380k",
    type: "Full-time",
    specialty: "Emergency Medicine",
    visa: true,
  },
  {
    title: "Registered Nurse — Cardiac ICU",
    employer: "Northwell Care",
    location: "New York, New York",
    salary: "$98k–$127k",
    type: "Full-time",
    specialty: "Nursing",
  },
  {
    title: "Clinical Pharmacist",
    employer: "Sage University Hospital",
    location: "Chicago, Illinois",
    salary: "$135k–$158k",
    type: "Full-time",
    specialty: "Pharmacy",
    visa: true,
  },
]

export const employers = [
  { name: "Harborview Health", openings: 48, tone: "bg-sky-100 text-sky-700" },
  { name: "Sage University", openings: 31, tone: "bg-violet-100 text-violet-700" },
  { name: "Northwell Care", openings: 22, tone: "bg-emerald-100 text-emerald-700" },
  { name: "Pioneer Medical", openings: 17, tone: "bg-amber-100 text-amber-700" },
]

export const benefits: Array<{
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    title: "Verified organizations",
    description: "A focused network of healthcare organizations with a transparent review process.",
    icon: ShieldCheck,
  },
  {
    title: "Careers, not just listings",
    description: "Find roles, training paths, and practical resources in one clear experience.",
    icon: HeartPulse,
  },
  {
    title: "Built for meaningful matches",
    description: "Future matching tools will surface roles aligned to your specialty and goals.",
    icon: Sparkles,
  },
  {
    title: "Simple employer workflows",
    description: "A dedicated workspace will help teams publish roles and manage candidates.",
    icon: BriefcaseBusiness,
  },
]

export const statistics = [
  { value: "50k+", label: "professionals" },
  { value: "3,000+", label: "healthcare organizations" },
  { value: "120k+", label: "career opportunities" },
  { value: "40+", label: "specialties represented" },
]

export const resources = [
  {
    category: "Residency guide",
    title: "How to create a residency application timeline that works for you",
    readTime: "7 min read",
    color: "from-sky-100 via-white to-teal-50",
  },
  {
    category: "Career insight",
    title: "What clinicians value most when choosing their next workplace",
    readTime: "5 min read",
    color: "from-violet-100 via-white to-sky-50",
  },
  {
    category: "International careers",
    title: "A practical guide to finding visa-supporting healthcare roles",
    readTime: "8 min read",
    color: "from-emerald-100 via-white to-cyan-50",
  },
]
