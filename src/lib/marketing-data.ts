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
  id?: string
  slug: string
  title: string
  employer: string
  employerSlug: string
  location: string
  salary: string
  type: string
  specialty: string
  setting: string
  posted: string
  summary: string
  responsibilities: string[]
  qualifications: string[]
  benefits: string[]
  visaSupport?: boolean
  featured?: boolean
  source?: "preview" | "live"
  organizationType?: string
  organizationWebsite?: string
}

export type Employer = {
  slug: string
  name: string
  location: string
  type: string
  openings: number
  verified: boolean
  tone: string
  description: string
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
    title: "Find healthcare jobs",
    description: "Search roles by specialty, location, setting, and employment type.",
    icon: Stethoscope,
    href: "/jobs",
  },
  {
    title: "Hire healthcare professionals",
    description: "Build your organization profile and prepare to reach qualified candidates.",
    icon: Building2,
    href: "/for-employers",
  },
  {
    title: "Explore residency and training",
    description: "Find practical guidance for residency, fellowship, and career milestones.",
    icon: GraduationCap,
    href: "/resources#residency",
  },
  {
    title: "Find visa-supporting roles",
    description: "Preview opportunities that may support international healthcare professionals.",
    icon: Landmark,
    href: "/jobs?visa=true",
  },
]

export const featuredJobs: Job[] = [
  {
    slug: "emergency-medicine-physician-boston",
    title: "Emergency Medicine Physician",
    employer: "Harborview Health Network",
    employerSlug: "harborview-health-network",
    location: "Boston, Massachusetts",
    salary: "$320,000-$380,000",
    type: "Full-time",
    specialty: "Emergency Medicine",
    setting: "Hospital",
    posted: "Preview listing",
    summary:
      "Join a collaborative emergency medicine team serving a diverse urban patient population in a modern teaching environment.",
    responsibilities: [
      "Provide evidence-based emergency care across a broad range of acuity levels.",
      "Collaborate with nursing, specialty, and support teams throughout the patient journey.",
      "Contribute to quality improvement and resident education initiatives.",
    ],
    qualifications: [
      "MD or DO degree from an accredited medical school.",
      "Board certified or board eligible in Emergency Medicine.",
      "Eligible for medical licensure in Massachusetts.",
    ],
    benefits: [
      "Comprehensive medical, dental, and vision coverage.",
      "Continuing medical education allowance.",
      "Retirement plan with employer contribution.",
    ],
    visaSupport: true,
    featured: true,
  },
  {
    slug: "registered-nurse-cardiac-icu-new-york",
    title: "Registered Nurse - Cardiac ICU",
    employer: "Northwell Care",
    employerSlug: "northwell-care",
    location: "New York, New York",
    salary: "$98,000-$127,000",
    type: "Full-time",
    specialty: "Nursing",
    setting: "Hospital",
    posted: "Preview listing",
    summary:
      "Support complex cardiac patients in a high-acuity ICU with strong clinical mentorship and interdisciplinary collaboration.",
    responsibilities: [
      "Deliver direct nursing care to critically ill cardiac patients.",
      "Coordinate care plans with physicians, pharmacists, and respiratory therapists.",
      "Participate in clinical education and unit-based improvement work.",
    ],
    qualifications: [
      "Active New York Registered Nurse license or eligibility.",
      "At least two years of acute care nursing experience.",
      "BLS and ACLS certification.",
    ],
    benefits: [
      "Clinical ladder and continuing education support.",
      "Flexible scheduling options.",
      "Health and retirement benefits.",
    ],
    featured: true,
  },
  {
    slug: "clinical-pharmacist-chicago",
    title: "Clinical Pharmacist",
    employer: "Sage University Hospital",
    employerSlug: "sage-university-hospital",
    location: "Chicago, Illinois",
    salary: "$135,000-$158,000",
    type: "Full-time",
    specialty: "Pharmacy",
    setting: "Academic Medical Center",
    posted: "Preview listing",
    summary:
      "Partner with physicians and care teams to optimize medication therapy in an academic medical center.",
    responsibilities: [
      "Review medication regimens and provide clinical recommendations.",
      "Support antimicrobial stewardship and medication safety programs.",
      "Precept pharmacy residents and students.",
    ],
    qualifications: [
      "PharmD from an ACPE-accredited program.",
      "Illinois pharmacist license or eligibility.",
      "PGY1 residency or equivalent clinical experience.",
    ],
    benefits: [
      "Academic appointment eligibility.",
      "Professional development funding.",
      "Comprehensive benefits package.",
    ],
    visaSupport: true,
    featured: true,
  },
  {
    slug: "family-medicine-physician-austin",
    title: "Family Medicine Physician",
    employer: "Pioneer Medical Group",
    employerSlug: "pioneer-medical-group",
    location: "Austin, Texas",
    salary: "$235,000-$285,000",
    type: "Full-time",
    specialty: "Family Medicine",
    setting: "Outpatient Clinic",
    posted: "Preview listing",
    summary:
      "Build long-term patient relationships in a growing outpatient practice with modern clinical support.",
    responsibilities: [
      "Provide comprehensive primary care across the adult lifespan.",
      "Coordinate preventive, chronic, and acute care services.",
      "Collaborate with an integrated behavioral health team.",
    ],
    qualifications: [
      "MD or DO degree.",
      "Board certified or board eligible in Family Medicine.",
      "Texas medical license or eligibility.",
    ],
    benefits: [
      "Four-day clinical schedule option.",
      "Malpractice coverage.",
      "Relocation assistance.",
    ],
  },
  {
    slug: "physical-therapist-seattle",
    title: "Physical Therapist",
    employer: "Harborview Health Network",
    employerSlug: "harborview-health-network",
    location: "Seattle, Washington",
    salary: "$92,000-$118,000",
    type: "Full-time",
    specialty: "Allied Health",
    setting: "Rehabilitation Center",
    posted: "Preview listing",
    summary:
      "Help patients regain mobility and independence through evidence-based rehabilitation care.",
    responsibilities: [
      "Evaluate mobility, function, and rehabilitation needs.",
      "Create individualized treatment plans and document outcomes.",
      "Coordinate care with physicians and occupational therapists.",
    ],
    qualifications: [
      "Doctor of Physical Therapy degree.",
      "Washington Physical Therapist license or eligibility.",
      "Strong patient communication skills.",
    ],
    benefits: [
      "Mentorship and specialty certification support.",
      "Paid continuing education.",
      "Comprehensive insurance coverage.",
    ],
  },
  {
    slug: "nurse-practitioner-phoenix",
    title: "Nurse Practitioner - Urgent Care",
    employer: "Northwell Care",
    employerSlug: "northwell-care",
    location: "Phoenix, Arizona",
    salary: "$128,000-$151,000",
    type: "Full-time",
    specialty: "Nursing",
    setting: "Urgent Care",
    posted: "Preview listing",
    summary:
      "Provide accessible, same-day care in a patient-centered urgent care network.",
    responsibilities: [
      "Assess and treat common acute illnesses and injuries.",
      "Order and interpret diagnostic tests.",
      "Coordinate follow-up care with primary and specialty clinicians.",
    ],
    qualifications: [
      "Active Arizona APRN license or eligibility.",
      "National nurse practitioner certification.",
      "Urgent care or emergency experience preferred.",
    ],
    benefits: [
      "Predictable shift scheduling.",
      "CME allowance.",
      "Medical, dental, vision, and retirement benefits.",
    ],
  },
]

export const employers: Employer[] = [
  {
    slug: "harborview-health-network",
    name: "Harborview Health Network",
    location: "Massachusetts and Washington",
    type: "Health System",
    openings: 2,
    verified: false,
    tone: "bg-sky-100 text-sky-700",
    description:
      "A product-preview health system profile representing hospital, rehabilitation, and academic care settings.",
  },
  {
    slug: "sage-university-hospital",
    name: "Sage University Hospital",
    location: "Chicago, Illinois",
    type: "Academic Medical Center",
    openings: 1,
    verified: false,
    tone: "bg-violet-100 text-violet-700",
    description:
      "A product-preview academic employer profile focused on clinical practice, education, and research.",
  },
  {
    slug: "northwell-care",
    name: "Northwell Care",
    location: "New York and Arizona",
    type: "Integrated Care Network",
    openings: 2,
    verified: false,
    tone: "bg-emerald-100 text-emerald-700",
    description:
      "A product-preview care network profile spanning hospital and ambulatory environments.",
  },
  {
    slug: "pioneer-medical-group",
    name: "Pioneer Medical Group",
    location: "Austin, Texas",
    type: "Medical Group",
    openings: 1,
    verified: false,
    tone: "bg-amber-100 text-amber-700",
    description:
      "A product-preview outpatient employer profile built around accessible primary care.",
  },
]

export const benefits: Array<{
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    title: "Healthcare-only focus",
    description: "A career experience structured around healthcare roles, settings, credentials, and specialties.",
    icon: HeartPulse,
  },
  {
    title: "Transparent organizations",
    description: "Employer profiles are designed to explain workplace context before a professional applies.",
    icon: ShieldCheck,
  },
  {
    title: "Useful career pathways",
    description: "Jobs, residency guidance, international career resources, and employer information in one place.",
    icon: Sparkles,
  },
  {
    title: "Purpose-built hiring tools",
    description: "Dedicated workflows for healthcare employers, recruiters, and candidate review.",
    icon: BriefcaseBusiness,
  },
]

export const platformPrinciples = [
  {
    value: "Healthcare only",
    label: "A focused taxonomy for clinical and non-clinical roles.",
  },
  {
    value: "U.S. focused",
    label: "Built around states, licenses, specialties, and care settings.",
  },
  {
    value: "Transparent by design",
    label: "Preview data is labeled until verified employer data is live.",
  },
  {
    value: "Accessible foundation",
    label: "Responsive, keyboard-friendly interfaces designed for WCAG alignment.",
  },
]

export const resources = [
  {
    slug: "residency-application-timeline",
    category: "Residency guide",
    title: "How to create a residency application timeline that works for you",
    description:
      "A practical framework for organizing exams, documents, applications, and interviews.",
    readTime: "7 min read",
    color: "from-sky-100 via-white to-teal-50",
  },
  {
    slug: "choosing-a-healthcare-employer",
    category: "Career insight",
    title: "What to evaluate when choosing your next healthcare employer",
    description:
      "Questions to ask about teams, workload, support, leadership, and professional growth.",
    readTime: "5 min read",
    color: "from-violet-100 via-white to-sky-50",
  },
  {
    slug: "visa-supporting-healthcare-roles",
    category: "International careers",
    title: "A practical introduction to visa-supporting healthcare roles",
    description:
      "Understand the information candidates should verify when reviewing international opportunities.",
    readTime: "8 min read",
    color: "from-emerald-100 via-white to-cyan-50",
  },
]

export function getJobBySlug(slug: string) {
  return featuredJobs.find((job) => job.slug === slug)
}
