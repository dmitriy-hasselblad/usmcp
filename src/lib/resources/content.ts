export type ResourceGuide = {
  slug: string
  category: string
  title: string
  description: string
  readTime: string
  image: { src: string; alt: string }
  introduction: string
  sections: { heading: string; paragraphs: string[]; checklist?: string[] }[]
  note?: string
}

export const resourceGuides: ResourceGuide[] = [
  {
    slug: "residency-application-timeline",
    category: "Residency guide",
    title: "How to create a residency application timeline that works for you",
    description: "A practical framework for organizing exams, documents, applications, and interviews.",
    readTime: "7 min read",
    image: {
      src: "/images/resources/residency-application-timeline.png",
      alt: "Healthcare professional planning a residency application timeline",
    },
    introduction: "A strong residency timeline is less about finding a perfect schedule and more about making your next decision visible early. Use one working plan, revisit it regularly, and leave room for program-specific requirements.",
    sections: [
      {
        heading: "Start with fixed dates",
        paragraphs: ["Add the dates you cannot move first: examination windows, application-system milestones, letter deadlines, graduation requirements, and interview commitments. Then work backward to create your preparation windows.", "Keep program requirements in the same place as your timeline. A date without its related document or task is easy to overlook."],
        checklist: ["Exams and score-release windows", "Application opening and submission dates", "Letters of recommendation", "Program-specific documents", "Interview and travel or virtual-interview availability"],
      },
      {
        heading: "Build a document system before you need it",
        paragraphs: ["Use clear file names and keep a private master copy of each document. Track the version, last review date, and where it has been used. This reduces last-minute rework when a program requests a different format.", "Ask mentors or letter writers early and give them enough context to help you effectively. A respectful reminder schedule is more useful than a rushed request."],
      },
      {
        heading: "Choose weekly priorities, not just a long list",
        paragraphs: ["Each week, choose one application task, one clinical or academic priority, and one practical task such as document review. Small, visible progress is easier to sustain than a large plan that is never revisited.", "Review the timeline after major changes. A new exam date, rotation, or personal commitment should lead to an updated plan, not a hidden conflict."],
      },
      {
        heading: "Prepare for interviews before invitations arrive",
        paragraphs: ["Create a concise introduction to your experience and the kind of training environment you are seeking. Prepare thoughtful questions about supervision, patient population, call expectations, wellbeing, and professional development.", "For every interview, keep a short private reflection after the conversation. Over time, these notes make comparisons more accurate than relying on memory alone."],
      },
    ],
  },
  {
    slug: "choosing-a-healthcare-employer",
    category: "Career insight",
    title: "What to evaluate when choosing your next healthcare employer",
    description: "Questions to ask about teams, workload, support, leadership, and professional growth.",
    readTime: "5 min read",
    image: {
      src: "/images/resources/choosing-a-healthcare-employer.png",
      alt: "Healthcare professionals discussing career opportunities",
    },
    introduction: "A job title and compensation range are important, but they rarely explain what daily work will feel like. Compare employers using the same questions so you can distinguish a compelling offer from a sustainable role.",
    sections: [
      {
        heading: "Understand the care environment",
        paragraphs: ["Ask how the team is structured, what patient population it serves, and how responsibilities are shared across disciplines. The setting, staffing model, and pace of care often matter as much as the position itself.", "Try to understand what changes during busy periods. A transparent answer about coverage and escalation is usually more useful than a broad description of culture."],
        checklist: ["Typical patient volume and acuity", "Staffing and coverage model", "On-site, hybrid, and on-call expectations", "Clinical technology and documentation workflow", "How the team handles unexpected workload"],
      },
      {
        heading: "Look for support you can name",
        paragraphs: ["Ask who provides orientation, clinical mentorship, feedback, and help with difficult cases. Good support is specific: a person, a schedule, a resource, or a clear process.", "If licensure, credentialing, relocation, or continuing education matters to you, discuss it before accepting an offer. Clarify what the employer provides and what remains your responsibility."],
      },
      {
        heading: "Compare the full offer",
        paragraphs: ["Review compensation alongside benefits, time off, scheduling predictability, retirement options, insurance, professional development, and any repayment or commitment terms. Request written details and take time to read them.", "When comparing offers, use your priorities rather than a single ranking. A role that supports your specialty goals and wellbeing may be a stronger fit than the highest initial number."],
      },
      {
        heading: "Ask how success is measured",
        paragraphs: ["Ask what a successful first 90 days and first year look like. This reveals whether expectations are realistic and whether leadership can describe how new team members grow.", "You can also ask why the role is open and how long similar team members tend to stay. The goal is context, not a perfect answer."],
      },
    ],
  },
  {
    slug: "visa-supporting-healthcare-roles",
    category: "International careers",
    title: "A practical introduction to visa-supporting healthcare roles",
    description: "Understand the information candidates should verify when reviewing international opportunities.",
    readTime: "8 min read",
    image: {
      src: "/images/resources/visa-supporting-healthcare-roles.png",
      alt: "Healthcare professional reviewing international career credentials",
    },
    introduction: "International healthcare careers involve separate questions about a role, professional licensing, credentials, and immigration. Treat each as its own workstream and request clear information from an employer before relying on an opportunity.",
    sections: [
      {
        heading: "Read the job listing carefully",
        paragraphs: ["A visa-supporting role should describe the employer, location, profession, and the point of contact who can discuss eligibility. Do not assume that a general statement about international applicants applies to every position or specialty.", "If an employer mentions sponsorship, ask which stage of the process they support and whether their answer depends on licensure, experience, location, or the role’s start date."],
        checklist: ["Employer legal name and direct contact", "Role location and employment type", "Licensure or certification requirements", "Whether sponsorship is considered for this specific role", "Expected timing and next steps"],
      },
      {
        heading: "Separate licensing from immigration",
        paragraphs: ["Professional authorization to practice is not the same as permission to work in the United States. Many healthcare professions are regulated by state boards, credentialing bodies, or both.", "Create a list of the requirements for the state and profession you are pursuing. Ask the employer what they can confirm, and use official licensing and immigration sources for decisions that affect your status."],
      },
      {
        heading: "Protect your information and your time",
        paragraphs: ["Legitimate employers should be able to explain the role and hiring process without requesting payment for a job offer. Be cautious with requests for sensitive documents before you have verified the organization and the person contacting you.", "Keep copies of communications and confirm key terms in writing. If an opportunity feels unclear, pause and ask for additional details rather than rushing because of a deadline."],
      },
      {
        heading: "Use qualified advice for personal decisions",
        paragraphs: ["This guide is general career information, not legal or immigration advice. Individual circumstances can change what options are available.", "For decisions about your immigration status or professional authorization, consult the relevant official agency or a qualified professional who can advise on your circumstances."],
      },
    ],
    note: "SM VIA does not provide legal or immigration advice and does not guarantee that any employer will sponsor a candidate.",
  },
]

export function getResourceGuide(slug: string) {
  return resourceGuides.find((guide) => guide.slug === slug)
}
