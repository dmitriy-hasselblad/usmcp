export type ResourceGuide = {
  slug: string
  category: string
  title: string
  description: string
  readTime: string
  image?: { src: string; alt: string }
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
  {
    slug: "build-a-healthcare-cv-that-gets-read",
    category: "CV & applications",
    title: "How to build a healthcare CV that makes your experience clear",
    description: "Organize credentials, clinical experience, and achievements so a hiring team can understand your background quickly.",
    readTime: "6 min read",
    image: {
      src: "/images/resources/healthcare-cv-guide.png",
      alt: "Healthcare professional reviewing a CV and professional credentials",
    },
    introduction: "A healthcare CV is not a list of every duty you have ever held. It is a clear professional record that helps a recruiter or hiring manager understand your scope of practice, credentials, and the impact of your experience.",
    sections: [
      {
        heading: "Lead with the information a healthcare employer needs first",
        paragraphs: ["Start with your name, credentials, city and state, professional contact details, and a LinkedIn or professional website link when it adds useful context. Keep personal details out of a U.S.-format CV: no photograph, date of birth, family information, or full home address.", "Follow with a concise professional summary. Name your profession, specialty or care setting, years or level of experience, and one or two strengths that are relevant to the roles you want."],
        checklist: ["Current credentials and professional contact details", "Professional summary tailored to your target role", "Active licenses and essential certifications", "Clinical experience in reverse chronological order"],
      },
      {
        heading: "Make clinical experience specific",
        paragraphs: ["For each role, include your title, organization, location, and dates. Then use three to five concise bullets that describe the work you performed, the patients or care setting you supported, and the outcomes you influenced.", "Use accurate action verbs such as Managed, Coordinated, Performed, Improved, Educated, or Collaborated. Add a metric only when you can explain and support it; a precise, truthful statement is stronger than an inflated claim."],
      },
      {
        heading: "Place licensure and certifications where they can be found",
        paragraphs: ["For many U.S. healthcare roles, licensure and certification are screening requirements. Put this section near the top, before education, and state the issuing body, jurisdiction, status, and renewal or expiration date where appropriate.", "Keep your CV current. A recruiter should not need to guess whether a license is active or whether an ACLS or BLS certification is still valid."],
      },
      {
        heading: "Choose a simple, readable format",
        paragraphs: ["Use a consistent typeface, clear section headings, and enough white space to scan quickly. A polished document should help the reader, not compete for attention with decorative elements.", "SM VIA’s CV Builder is designed around this structure and lets you keep multiple private versions for different specialties or career goals."],
      },
    ],
  },
  {
    slug: "write-a-healthcare-cover-letter-with-purpose",
    category: "CV & applications",
    title: "Write a healthcare cover letter with purpose",
    description: "Use a short, tailored letter to connect your experience to a specific role without repeating your CV.",
    readTime: "5 min read",
    image: {
      src: "/images/resources/healthcare-cover-letter-guide.png",
      alt: "Healthcare professional writing a tailored cover letter at a desk",
    },
    introduction: "A good cover letter gives the hiring team a reason to look more closely at your application. It should be focused on one opportunity, written in your own voice, and short enough to read in one sitting.",
    sections: [
      {
        heading: "Start with the role and your strongest match",
        paragraphs: ["Open by naming the position and organization. Then state the part of your background that is most relevant: specialty experience, care setting, leadership scope, clinical training, or a credential the role requires.", "Avoid generic openings that could be sent to any employer. One specific sentence about the work or organization is more persuasive than a long introduction."],
      },
      {
        heading: "Use one or two evidence-based examples",
        paragraphs: ["Choose examples that show how you work: coordinating complex care, improving a workflow, supporting a patient population, mentoring colleagues, or working effectively in a high-acuity environment.", "The letter should add context to your CV, not repeat every role. Explain why an experience matters for this opportunity."],
      },
      {
        heading: "Finish with a clear next step",
        paragraphs: ["Close by expressing interest in discussing the role and confirming the documents included with your application. Keep the tone professional and direct.", "Before sending, check the organization name, role title, dates, and attachments. Small mistakes can make a tailored application look rushed."],
        checklist: ["Role and organization named correctly", "One or two relevant examples", "No unsupported clinical or performance claims", "CV and selected cover letter attached intentionally"],
      },
    ],
  },
  {
    slug: "create-a-healthcare-job-search-plan",
    category: "Job search",
    title: "Create a healthcare job search plan you can sustain",
    description: "Turn a broad search into a practical weekly routine with defined role criteria, alerts, and follow-up steps.",
    readTime: "6 min read",
    image: {
      src: "/images/resources/healthcare-job-search-plan.png",
      alt: "Healthcare professional planning a job search with a calendar and notebook",
    },
    introduction: "Healthcare career searches become easier to manage when you define what you are looking for before every new listing changes your plan. A simple routine helps you compare opportunities consistently and follow up without losing important details.",
    sections: [
      {
        heading: "Define your non-negotiables and preferences",
        paragraphs: ["Separate essential requirements from preferences. Examples include profession, specialty, state licensure eligibility, schedule, employment type, commute, relocation, and visa considerations. This makes it easier to recognize a genuine match.", "Review these criteria when your circumstances change, but do not rewrite them for every posting. Consistency makes comparisons more useful."],
        checklist: ["Target profession and specialty", "States or regions you can work in", "Employment and workplace preferences", "Credentials you already hold and those in progress", "Compensation and schedule considerations"],
      },
      {
        heading: "Set alerts, then make time to evaluate them",
        paragraphs: ["A saved search can reduce repetitive browsing, but an alert is only useful when you have a routine for reviewing it. Choose a realistic schedule for reading new roles, tailoring applications, and recording follow-ups.", "Do not apply automatically to every alert. Read the requirements, confirm the employer and work setting, and decide whether your materials represent a real match."],
      },
      {
        heading: "Keep a private application record",
        paragraphs: ["Track the role, organization, date applied, contact, documents used, and next action. This prevents duplicate applications and gives you useful context if an employer contacts you later.", "After interviews or recruiter conversations, record a few factual notes while they are fresh. They will help you compare opportunities and prepare thoughtful follow-up questions."],
      },
      {
        heading: "Review progress every two weeks",
        paragraphs: ["Look at the quality of roles, not only the number of applications. If you are not seeing relevant opportunities, adjust your saved searches, location preferences, profile information, or target specialty.", "A good job search plan is designed to be repeated. Small, regular actions are more sustainable than occasional bursts of activity."],
      },
    ],
  },
]

export function getResourceGuide(slug: string) {
  return resourceGuides.find((guide) => guide.slug === slug)
}
