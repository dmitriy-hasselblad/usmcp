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
  sources?: { label: string; url: string }[]
}

function createStateLicensureGuide({
  state,
  slug,
  authority,
  applicationService,
  applicationUrl,
  verificationService,
  verificationUrl,
  image,
}: {
  state: string
  slug: string
  authority: string
  applicationService: string
  applicationUrl: string
  verificationService: string
  verificationUrl: string
  image: ResourceGuide["image"]
}): ResourceGuide {
  return {
    slug,
    category: "Licensure guides",
    title: `${state} healthcare licensure: a practical research checklist`,
    description: `Identify the correct ${state} licensing authority, confirm your professional pathway, and use official services before planning a start date.`,
    readTime: "6 min read",
    image,
    introduction: `${state} healthcare licensure is profession-specific. Start with your exact professional title and intended scope of practice, then use the current instructions issued by the authority responsible for that profession.`,
    sections: [
      {
        heading: "Match your role to the right licensing authority",
        paragraphs: [`${authority} provides a starting point for regulated professions, but individual healthcare professions may have their own board, portal, forms, and eligibility requirements. Confirm the authority for your exact credential before taking the next step.`, "Do not assume that an endorsement, compact, training, examination, or renewal route applies because it is available to another profession. Read the current route for your own profession and circumstances."],
        checklist: ["Exact professional title and credential", "Relevant board or licensing authority", "Initial, endorsement, compact, training, or renewal pathway", "Target role’s timing and employer credentialing requirements"],
      },
      {
        heading: "Use official application information before gathering documents",
        paragraphs: [`Begin with ${applicationService}. The correct checklist may vary by profession and can require education verification, examination history, prior license verification, background information, or documents sent directly from an institution or another authority.`, "Prepare only what the relevant board asks for. Keep a private record of each request, sending organization, date, and confirmation so you can follow up accurately."],
      },
      {
        heading: "Verify status through the official record",
        paragraphs: [`Use ${verificationService} to check a current public record when appropriate. A resume, third-party profile, submitted application, or employer conversation is not a substitute for official confirmation.`, "Before relying on a start date or an offer that requires professional authorization, confirm your current status with the authority responsible for your license."],
      },
      {
        heading: "Keep individual decisions with the licensing authority",
        paragraphs: ["Rules, forms, and operating procedures can change. Consult current official instructions and contact the relevant board when you need an answer for your own application or circumstances.", `SM VIA does not process ${state} license applications, determine eligibility, or guarantee a licensing outcome.`],
      },
    ],
    note: `This is general career information, not legal, immigration, or professional licensing advice. Always confirm requirements directly with the appropriate ${state} licensing authority.`,
    sources: [
      { label: authority, url: applicationUrl },
      { label: verificationService, url: verificationUrl },
    ],
  }
}

export const resourceGuides: ResourceGuide[] = [
  {
    slug: "florida-healthcare-licensure-research-checklist",
    category: "Licensure guides",
    title: "Florida healthcare licensure: a practical research checklist",
    description: "Use the official Florida resources to identify the correct profession, pathway, documents, and verification steps before applying.",
    readTime: "7 min read",
    image: {
      src: "/images/resources/florida-licensure-research-checklist.png",
      alt: "Healthcare professional researching Florida licensure requirements",
    },
    introduction: "Florida licensure is profession-specific. Before you spend money, accept a role, or send documents, identify the exact license or registration you need and read the current requirements issued by the relevant Florida board or department.",
    sections: [
      {
        heading: "Identify the exact profession and pathway",
        paragraphs: ["Begin with the profession you intend to practice, not just the job title. A registered nurse, physician, physician assistant, therapist, pharmacist, and trainee may be governed by different boards, pathways, examinations, and document requirements.", "Then determine whether you are applying for an initial license, endorsement from another jurisdiction, an interstate compact pathway, a training registration, or another limited pathway. Do not assume a pathway applies simply because you hold a license elsewhere."],
        checklist: ["Exact profession and Florida board", "Current license status in every jurisdiction", "Initial, endorsement, compact, or training pathway", "Target role’s start date and any employer-specific requirements"],
      },
      {
        heading: "Use Florida’s official MQA services first",
        paragraphs: ["Florida’s Division of Medical Quality Assurance provides the central starting point for applications, renewals, license verification, and help resources. Create or use an MQA account only through the official service and keep your application contact details current.", "The MQA portal is the right place to begin, but it does not replace the profession-specific instructions published by your board. Read both before submitting an application."],
      },
      {
        heading: "Prepare documents according to your board’s checklist",
        paragraphs: ["Requirements may include education verification, examination history, license verification from another jurisdiction, background screening, employment history, and explanations or supporting records for affirmative disclosures. The exact list varies by profession and pathway.", "Use the exact name that appears on your application for every document where possible. Keep a private record of what you requested, the date, the issuing organization, and when it was sent."],
      },
      {
        heading: "Verify status before relying on an offer or start date",
        paragraphs: ["A job offer, credentialing request, or an employer’s interest does not itself grant permission to practice. Confirm your status through the official Florida system and discuss a realistic start date with the employer.", "If you need a formal certification of a license held in another state, contact the relevant issuing board. Florida’s own certification process differs for some professions, including nurses and physicians."],
      },
      {
        heading: "Keep this guide as a research tool, not personal advice",
        paragraphs: ["Licensing rules, processing procedures, and documentation requirements can change. For a decision that affects your ability to practice, rely on the current official board instructions and ask the board or a qualified adviser about your individual circumstances.", "SM VIA does not process applications, assess eligibility, or guarantee a licensing outcome."],
      },
    ],
    note: "This is general career information, not legal, immigration, or professional licensing advice. Always confirm requirements directly with the appropriate Florida licensing authority.",
    sources: [
      { label: "Florida Department of Health — MQA Help Center", url: "https://www.flhealthsource.gov/help-center/landing-page.html" },
      { label: "Florida Department of Health — License Certification", url: "https://flhealthsource.gov/license-certification/" },
      { label: "Florida Board of Medicine — Applying for a New License", url: "https://flboardofmedicine.gov/applying-for-a-new-license-4/" },
    ],
  },
  {
    slug: "texas-healthcare-licensure-research-checklist",
    category: "Licensure guides",
    title: "Texas healthcare licensure: a practical research checklist",
    description: "Find the right Texas board, confirm your pathway, and use official verification tools before planning a start date.",
    readTime: "7 min read",
    image: {
      src: "/images/resources/texas-licensure-research-checklist.png",
      alt: "Healthcare professional reviewing Texas licensure documents",
    },
    introduction: "Texas healthcare licensure is governed by the board that regulates your exact profession. Start with the professional title and scope of the role—not a general job category—then follow the board’s current instructions for your pathway.",
    sections: [
      {
        heading: "Match the role to the right Texas authority",
        paragraphs: ["Texas does not use one license process for every healthcare profession. Physicians, physician assistants, radiologic technologists, respiratory care practitioners, nurses, pharmacists, therapists, and other professionals may have different licensing authorities and portals.", "Confirm the target role’s exact title with the employer. Then locate the applicable Texas board and read its current application instructions before requesting documents or paying a fee."],
        checklist: ["Exact Texas professional title", "Relevant state board or licensing authority", "Initial, endorsement, compact, training, or renewal pathway", "Employer credentialing and intended start date"],
      },
      {
        heading: "Use the profession-specific application portal",
        paragraphs: ["The Texas Medical Board provides application and verification services for the professions it regulates. The Texas Board of Nursing maintains a separate Nurse Portal for nursing applications and other account actions.", "Do not assume that a nursing route, a physician route, or an interstate compact option applies to another profession. The applicable board is the source for current eligibility, documentation, and submission requirements."],
      },
      {
        heading: "Verify current status through the official system",
        paragraphs: ["Before accepting a start date that depends on authorization to practice, check the official verification service for your profession. The Texas Medical Board’s public lookup provides license and permit information for the professions it regulates; nursing verification has its own official process.", "An employer’s interest or a submitted application does not establish that you are authorized to practice. Keep your own record of each document request, confirmation, and status update."],
      },
      {
        heading: "Use current board instructions for individual decisions",
        paragraphs: ["Rules and operational procedures can change, and personal circumstances can affect an application. Confirm requirements directly with the relevant board before making a decision about work, relocation, or a start date.", "SM VIA does not process Texas license applications, assess eligibility, or guarantee any licensing outcome."],
      },
    ],
    note: "This is general career information, not legal, immigration, or professional licensing advice. Always confirm requirements directly with the appropriate Texas licensing authority.",
    sources: [
      { label: "Texas Medical Board — Applicants and licensees", url: "https://www.tmb.texas.gov/apply-renew" },
      { label: "Texas Medical Board — Look up a license", url: "https://www.tmb.texas.gov/index.php/resources/for-the-public/look-up-a-license" },
      { label: "Texas Board of Nursing — Nurse Portal and licensure", url: "https://www.bon.texas.gov/" },
    ],
  },
  {
    slug: "california-healthcare-licensure-research-checklist",
    category: "Licensure guides",
    title: "California healthcare licensure: a practical research checklist",
    description: "Identify your California board, use the correct licensing service, and check official records before relying on a role or start date.",
    readTime: "7 min read",
    image: {
      src: "/images/resources/california-licensure-research-checklist.png",
      alt: "Healthcare professional reviewing California licensure documents",
    },
    introduction: "California licenses many healthcare professions through distinct boards and committees. Start by matching your exact profession to the relevant California authority, then use its current instructions for the pathway you are considering.",
    sections: [
      {
        heading: "Identify the board that regulates your profession",
        paragraphs: ["The California Department of Consumer Affairs includes multiple healthcare licensing boards and committees. A physician, registered nurse, physical therapist, physician assistant, respiratory care practitioner, psychologist, pharmacist, or other professional may need a different board and different requirements.", "Use the role title in the job posting and your own credential type to identify the correct authority. Do not rely on a general California application page if your profession has a dedicated board."],
        checklist: ["Exact California professional title", "Relevant board, committee, or department", "Initial, postgraduate training, endorsement, or other pathway", "Current license status in every jurisdiction where you have practiced"],
      },
      {
        heading: "Read the current checklist before applying",
        paragraphs: ["The Medical Board of California directs physician applicants to its application information and checklist before applying. Other boards publish their own requirements, documents, and routes through California’s licensing services.", "Prepare only the documents requested for your profession and pathway. Education, training, fingerprinting, examinations, prior licenses, and explanations for disclosures can be handled differently depending on the board."],
      },
      {
        heading: "Verify licenses through official records",
        paragraphs: ["California’s Department of Consumer Affairs provides an online license search for many regulated professions. The Medical Board of California also publishes its own verification and licensee profile information for the professionals it regulates.", "Use official verification rather than a resume, third-party profile, or employer statement when you need to confirm a status. A pending application does not itself establish authority to practice."],
      },
      {
        heading: "Confirm your own pathway with the right authority",
        paragraphs: ["Licensure requirements and processing procedures can change. Review the current instructions from your board before accepting a role, relocating, or choosing a proposed start date.", "SM VIA does not submit California applications, determine eligibility, or guarantee that an individual will receive a license."],
      },
    ],
    note: "This is general career information, not legal, immigration, or professional licensing advice. Always confirm requirements directly with the appropriate California licensing authority.",
    sources: [
      { label: "California Department of Consumer Affairs — licensing services", url: "https://www.ca.gov/departments/210/" },
      { label: "California Department of Consumer Affairs — license search", url: "https://search.dca.ca.gov/" },
      { label: "Medical Board of California — physician and surgeon license", url: "https://www.mbc.ca.gov/Licensing/Physicians-and-Surgeons/Apply/Physicians-and-Surgeons-License/default.aspx" },
    ],
  },
  {
    slug: "new-york-healthcare-licensure-research-checklist",
    category: "Licensure guides",
    title: "New York healthcare licensure: a practical research checklist",
    description: "Use New York’s Office of the Professions to identify the correct licensure route, direct-source documents, and verify your professional status.",
    readTime: "7 min read",
    image: {
      src: "/images/resources/new-york-licensure-research-checklist.png",
      alt: "Healthcare professional reviewing New York licensure documents",
    },
    introduction: "New York professional licensing is managed through the New York State Education Department’s Office of the Professions for many healthcare occupations. Start with your exact profession and its current requirements before deciding how to proceed.",
    sections: [
      {
        heading: "Find the requirements for your exact profession",
        paragraphs: ["The Office of the Professions provides profession-specific licensing information. Healthcare titles that sound similar can still have different education, examination, registration, or application requirements.", "Identify the precise license you need for the work you intend to perform in New York. Then read the relevant profession page rather than relying on an employer’s job title alone."],
        checklist: ["Exact New York profession and license type", "Current registration or license status elsewhere", "Initial application, endorsement, examination, or limited-permit route", "Required direct-source education and license verification"],
      },
      {
        heading: "Plan for direct-source documentation",
        paragraphs: ["New York’s Office of the Professions publishes guidance on how education, experience, examination, and prior license information must be verified. Some documents need to be sent directly by the institution, supervisor, or licensing authority.", "For example, nursing applicants who hold an out-of-state license may use Nursys where applicable, while other situations may require the appropriate verification form. Always follow the instructions for your own profession and route."],
      },
      {
        heading: "Check license information in the official verification service",
        paragraphs: ["New York’s online verification system is maintained by the Office of the Professions and is its primary source for public license verification. Use it to check a current record instead of relying on an unofficial profile or an old document.", "Submitting an application, receiving an offer, or completing one part of the process does not itself authorize professional practice. Confirm your record and registration status through the official system."],
      },
      {
        heading: "Keep the final decision with the licensing authority",
        paragraphs: ["Licensing rules, forms, and procedures can change. Read the current Office of the Professions guidance and contact the relevant authority when you need an answer about your individual circumstances.", "SM VIA does not process New York applications, assess eligibility, or guarantee a licensing decision."],
      },
    ],
    note: "This is general career information, not legal, immigration, or professional licensing advice. Always confirm requirements directly with the appropriate New York licensing authority.",
    sources: [
      { label: "New York State Education Department — Office of the Professions", url: "https://www.op.nysed.gov/" },
      { label: "New York State — online license verification", url: "https://op-prod.nysed.gov/verification-search" },
      { label: "Office of the Professions — general licensing information", url: "https://www.op.nysed.gov/about/general-information-policies" },
    ],
  },
  {
    ...createStateLicensureGuide({
      state: "Pennsylvania",
      slug: "pennsylvania-healthcare-licensure-research-checklist",
      authority: "Pennsylvania Department of State — Professional Licensing",
      applicationService: "Pennsylvania’s Professional Licensing services and the appropriate licensing board",
      applicationUrl: "https://www.pa.gov/agencies/dos/programs/professional-licensing",
      verificationService: "Pennsylvania Licensing System (PALS)",
      verificationUrl: "https://www.pals.pa.gov/#/page/default",
      image: { src: "/images/resources/pennsylvania-licensure-research-checklist.png", alt: "Healthcare professional reviewing Pennsylvania licensure documents" },
    }),
  },
  {
    ...createStateLicensureGuide({
      state: "Illinois",
      slug: "illinois-healthcare-licensure-research-checklist",
      authority: "Illinois Department of Financial and Professional Regulation",
      applicationService: "Illinois Division of Professional Regulation and the appropriate profession page",
      applicationUrl: "https://idfpr.illinois.gov/dpr.html",
      verificationService: "Illinois professional license lookup",
      verificationUrl: "https://www.illinois.gov/services/service.professional-license-look-up.html",
      image: { src: "/images/resources/illinois-licensure-research-checklist.png", alt: "Healthcare professional reviewing Illinois licensure documents" },
    }),
  },
  {
    ...createStateLicensureGuide({
      state: "Ohio",
      slug: "ohio-healthcare-licensure-research-checklist",
      authority: "Ohio professional licensing boards",
      applicationService: "the appropriate Ohio professional licensing board and eLicense Ohio",
      applicationUrl: "https://elicense.ohio.gov/",
      verificationService: "eLicense Ohio license lookup",
      verificationUrl: "https://elicense.ohio.gov/",
      image: { src: "/images/resources/ohio-licensure-research-checklist.png", alt: "Healthcare professional reviewing Ohio licensure documents" },
    }),
  },
  {
    ...createStateLicensureGuide({
      state: "Georgia",
      slug: "georgia-healthcare-licensure-research-checklist",
      authority: "Georgia Professional Licensing Boards and profession-specific boards",
      applicationService: "Georgia’s professional licensing information and the relevant profession board",
      applicationUrl: "https://georgia.gov/professional-licenses-certifications",
      verificationService: "Georgia professional license verification",
      verificationUrl: "https://secure.sos.state.ga.us/verification/",
      image: { src: "/images/resources/georgia-licensure-research-checklist.png", alt: "Healthcare professional reviewing Georgia licensure documents" },
    }),
  },
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
