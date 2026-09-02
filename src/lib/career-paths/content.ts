export type CareerPathReadiness = "Explore now" | "Develop in parallel" | "Longer-term option"

export type CareerPathOption = {
  title: string
  readiness: CareerPathReadiness
  description: string
  jobTitles: string[]
}

export type CareerPath = {
  slug: string
  eyebrow: string
  title: string
  summary: string
  startingPoint: string
  transferableSkills: string[]
  options: CareerPathOption[]
  questions: string[]
  nextSteps: string[]
  resourceHref?: string
  resourceLabel?: string
}

export const careerPaths: CareerPath[] = [
  {
    slug: "dentist-to-non-clinical-healthcare",
    eyebrow: "Career transition",
    title: "Dentist to non-clinical healthcare",
    summary: "Use clinical credibility, patient perspective, and dental expertise to explore industry, education, product, and operations roles.",
    startingPoint: "For dentists with clinical experience who want to remain in healthcare without making chairside practice their primary career.",
    transferableSkills: ["Clinical judgment", "Patient communication", "Dental workflow knowledge", "Evidence-based decision making", "Stakeholder collaboration"],
    options: [
      { title: "Clinical affairs and product roles", readiness: "Explore now", description: "Dental and MedTech companies value clinicians who can translate real care settings into product, training, and customer insight.", jobTitles: ["Clinical Affairs Specialist", "Dental Product Specialist", "Clinical Product Associate"] },
      { title: "Clinical education and professional training", readiness: "Explore now", description: "Help clinicians adopt new technologies, protocols, and products through education designed for practice settings.", jobTitles: ["Clinical Education Specialist", "Professional Education Manager", "Dental Trainer"] },
      { title: "Medical or scientific writing", readiness: "Develop in parallel", description: "Build a portfolio of clear, evidence-led writing and learn the standards used in medical communications.", jobTitles: ["Medical Writer", "Scientific Communications Associate", "Content Specialist"] },
      { title: "Medical affairs or MSL", readiness: "Longer-term option", description: "These roles can be a strong fit, but requirements vary by employer and therapeutic area; relevant industry exposure often helps first.", jobTitles: ["Medical Affairs Associate", "Medical Science Liaison", "Scientific Advisor"] },
    ],
    questions: ["Do you want to stay close to dental care, or move toward broader MedTech?", "Would you rather educate people, work with products, or shape evidence and communication?", "Which current job descriptions ask for skills you can begin demonstrating now?"],
    nextSteps: ["Choose two target role families and save ten current job descriptions for each.", "Rewrite your CV around clinical outcomes, collaboration, teaching, and technology exposure.", "Speak with professionals already working in dental industry, education, or clinical affairs.", "Build one practical work sample: a training outline, product feedback brief, or evidence summary."],
  },
  {
    slug: "health-science-to-healthcare-careers",
    eyebrow: "Career discovery",
    title: "Health Science degree to healthcare careers",
    summary: "Compare patient-adjacent, operational, research, and allied-health paths before committing to another long degree.",
    startingPoint: "For Health Science graduates with early clinical or technical experience who want stability, a realistic time-to-career, and clearer options.",
    transferableSkills: ["Healthcare terminology", "Patient-facing experience", "Clinic workflow awareness", "Documentation", "Team communication"],
    options: [
      { title: "Specialty clinic operations", readiness: "Explore now", description: "Use knowledge of a specialty setting to target coordinator and operations roles where direct relevance can stand out.", jobTitles: ["Patient Services Coordinator", "Clinic Operations Coordinator", "Referral Coordinator"] },
      { title: "Clinical research", readiness: "Explore now", description: "Research teams often need organized professionals who understand patient interaction, consent, and careful documentation.", jobTitles: ["Clinical Research Coordinator", "Research Assistant", "Study Start-up Associate"] },
      { title: "Health information and quality", readiness: "Develop in parallel", description: "Shorter certifications or focused training can help turn a general degree into a more specific operations path.", jobTitles: ["Health Information Specialist", "Quality Coordinator", "Compliance Assistant"] },
      { title: "Allied health professions", readiness: "Longer-term option", description: "Imaging, sonography, laboratory science, and other roles may offer a clearer clinical lane, but require program and licensing research.", jobTitles: ["Radiologic Technologist", "Diagnostic Medical Sonographer", "Clinical Laboratory Technologist"] },
    ],
    questions: ["How much direct patient care do you want in your day-to-day work?", "Is part-time flexibility a future priority?", "Would a targeted certificate give you enough access before pursuing graduate school?"],
    nextSteps: ["Compare five roles by education length, local demand, schedule, pay range, and licensing requirements.", "Search within specialty clinics and networks where your previous experience is directly relevant.", "Interview two people in roles you are considering before applying to a program.", "Make your applications specific to each healthcare setting rather than broad administration applications."],
  },
  {
    slug: "biology-microbiology-to-public-health",
    eyebrow: "Education to career",
    title: "Biology or Microbiology to public health",
    summary: "Connect laboratory science to population health through surveillance, prevention, research, and public-health programs.",
    startingPoint: "For Biology or Microbiology graduates deciding whether to work first, pursue an MPH/MSPH, or stay close to laboratory science.",
    transferableSkills: ["Laboratory foundations", "Scientific literacy", "Data handling", "Infectious disease knowledge", "Research methods"],
    options: [
      { title: "Public health laboratories and surveillance", readiness: "Explore now", description: "Laboratory and surveillance teams offer a direct bridge between microbiology training and population health work.", jobTitles: ["Public Health Laboratory Technician", "Disease Surveillance Assistant", "Laboratory Research Assistant"] },
      { title: "Research coordination and infection prevention", readiness: "Explore now", description: "Healthcare systems and research groups need people who can support studies, prevention programs, and careful reporting.", jobTitles: ["Clinical Research Coordinator", "Infection Prevention Assistant", "Research Program Assistant"] },
      { title: "MPH: population and program focus", readiness: "Develop in parallel", description: "An MPH can be useful when your intended work centers on epidemiology, programs, policy, surveillance, or management.", jobTitles: ["Program Coordinator", "Epidemiology Assistant", "Health Program Analyst"] },
      { title: "MSPH: laboratory and research focus", readiness: "Develop in parallel", description: "A specialized degree can make more sense when you know you want to deepen microbiology, infectious disease, or research work.", jobTitles: ["Microbiology Research Associate", "Laboratory Scientist", "Infectious Disease Researcher"] },
    ],
    questions: ["Do you prefer lab and research work, or population and program work?", "Which five-year target roles require an MPH, MSPH, or neither?", "Can a year of relevant work answer the question before you invest in graduate school?"],
    nextSteps: ["Collect current entry-level postings in labs, surveillance, research, and public-health programs.", "Compare degree curricula with the qualifications in target roles—not only with degree titles.", "Seek internships, volunteer work, or faculty projects that produce relevant evidence of experience.", "Use informational interviews to understand the local public-health market and credential expectations."],
  },
  {
    slug: "nurse-to-non-bedside-healthcare",
    eyebrow: "Career transition",
    title: "Nurse to non-bedside healthcare",
    summary: "Translate nursing experience into care coordination, quality, informatics, education, clinical research, and healthcare operations.",
    startingPoint: "For nurses who want to use clinical knowledge in a role with less or no routine bedside care.",
    transferableSkills: ["Care coordination", "Clinical documentation", "Patient education", "Prioritization", "Interdisciplinary teamwork"],
    options: [
      { title: "Care coordination and utilization", readiness: "Explore now", description: "Many roles build directly on patient advocacy, discharge planning, and navigating complex care.", jobTitles: ["Care Coordinator", "Case Management Nurse", "Utilization Review Nurse"] },
      { title: "Quality, safety, and informatics", readiness: "Develop in parallel", description: "Clinical experience becomes especially valuable when paired with quality improvement or health-information systems knowledge.", jobTitles: ["Clinical Quality Specialist", "Patient Safety Coordinator", "Clinical Informatics Nurse"] },
      { title: "Clinical education and research", readiness: "Explore now", description: "Organizations need nurses who can teach, support product adoption, or coordinate patient-centered studies.", jobTitles: ["Clinical Educator", "Clinical Research Nurse", "Nurse Educator"] },
    ],
    questions: ["Which part of nursing do you most want to retain: education, advocacy, systems, or clinical science?", "Are you seeking a different setting or a genuinely non-clinical role?", "Which certifications are requested repeatedly in your preferred direction?"],
    nextSteps: ["Define your preferred work setting and schedule before searching job titles.", "Document measurable examples of care coordination, improvement work, and education.", "Review job descriptions for case management, quality, informatics, education, and research.", "Use targeted continuing education only after you can link it to a target role."],
  },
  {
    slug: "pharmacist-to-medical-affairs-industry",
    eyebrow: "Career transition",
    title: "Pharmacist to Medical Affairs or industry",
    summary: "Build from medication expertise and clinical communication toward medical information, scientific communications, and industry-facing roles.",
    startingPoint: "For pharmacists interested in industry, Medical Affairs, evidence communication, product, or commercial roles.",
    transferableSkills: ["Medication expertise", "Evidence evaluation", "Patient and clinician education", "Regulatory awareness", "Cross-functional communication"],
    options: [
      { title: "Medical information and scientific communications", readiness: "Explore now", description: "These roles rely on clear, accurate communication about products and evidence.", jobTitles: ["Medical Information Specialist", "Scientific Communications Associate", "Medical Content Reviewer"] },
      { title: "Medical Affairs and field medical", readiness: "Develop in parallel", description: "Build therapeutic-area depth, presentation experience, and industry exposure for increasingly strategic roles.", jobTitles: ["Medical Affairs Associate", "Field Medical Associate", "Medical Science Liaison"] },
      { title: "Market access, product, or commercial roles", readiness: "Explore now", description: "Pharmacy knowledge can help teams communicate clinical value and support healthcare customers responsibly.", jobTitles: ["Clinical Product Specialist", "Market Access Associate", "Pharmacy Account Manager"] },
    ],
    questions: ["Do you want to work primarily with evidence, external clinicians, products, or business teams?", "Which therapeutic area do you already know deeply?", "What industry experience can you demonstrate without leaving your current role immediately?"],
    nextSteps: ["Choose one therapeutic area and follow its current clinical and product landscape.", "Create evidence summaries or educational presentations that demonstrate scientific communication.", "Compare entry points such as medical information, product specialist, and Medical Affairs associate roles.", "Connect with pharmacists already working in industry to understand the organization-specific paths."],
  },
  {
    slug: "physician-to-leadership-operations-consulting",
    eyebrow: "Career transition",
    title: "Physician to leadership, operations, or consulting",
    summary: "Turn frontline clinical insight into influence over care delivery, quality, strategy, and organizational performance.",
    startingPoint: "For physicians exploring a broader leadership role while keeping some, all, or none of their clinical practice.",
    transferableSkills: ["Clinical leadership", "Complex decisions", "Patient safety", "Systems thinking", "Credibility with care teams"],
    options: [
      { title: "Medical leadership and quality", readiness: "Explore now", description: "Start with operational, quality, or service-line responsibilities that build visible leadership experience.", jobTitles: ["Medical Director", "Physician Quality Lead", "Service Line Medical Leader"] },
      { title: "Healthcare operations", readiness: "Develop in parallel", description: "Operations roles reward clinicians who can improve access, workflows, outcomes, and team alignment.", jobTitles: ["Clinical Operations Director", "Physician Executive", "Care Delivery Leader"] },
      { title: "Healthcare consulting", readiness: "Develop in parallel", description: "Consulting may fit physicians who enjoy structured problem solving, analysis, and change across organizations.", jobTitles: ["Healthcare Consultant", "Clinical Strategy Consultant", "Physician Advisor"] },
    ],
    questions: ["Do you want authority within one organization or variety across many?", "How much clinical practice do you want to retain?", "What operational outcomes have you already improved or influenced?"],
    nextSteps: ["Volunteer for a measurable quality, access, or workflow improvement project.", "Translate clinical achievements into operational outcomes for your CV.", "Talk to physician leaders in your preferred type of organization.", "Evaluate formal leadership education only against a defined next role."],
  },
  {
    slug: "international-graduate-to-us-healthcare",
    eyebrow: "International pathway",
    title: "International graduate to U.S. healthcare",
    summary: "Organize licensure, credentialing, training, and employer research into a practical U.S.-focused plan.",
    startingPoint: "For internationally educated healthcare professionals evaluating pathways into U.S. practice, training, research, or healthcare-adjacent work.",
    transferableSkills: ["Professional education", "Clinical or technical training", "Cross-cultural communication", "Adaptability", "Healthcare experience"],
    options: [
      { title: "Licensure and training pathway", readiness: "Develop in parallel", description: "Requirements depend on profession and state; work from official authorities and build a dated document checklist.", jobTitles: ["Resident Physician", "Licensed Nurse", "Licensed Allied Health Professional"] },
      { title: "Research and healthcare-adjacent experience", readiness: "Explore now", description: "Some roles can help you build U.S. experience while you clarify longer-term credentialing steps.", jobTitles: ["Research Coordinator", "Clinical Research Assistant", "Healthcare Program Assistant"] },
      { title: "Employer-supported opportunities", readiness: "Longer-term option", description: "Sponsorship and employer support vary widely; focus on published policies and direct confirmation from employers.", jobTitles: ["Sponsored Healthcare Professional", "Clinical Fellow", "Specialty Program Associate"] },
    ],
    questions: ["Which U.S. state and profession are you planning around?", "Which requirements must be completed before an employer can consider you?", "What work experience is permitted while your credentialing pathway progresses?"],
    nextSteps: ["Use official state and profession-specific sources as the starting point for every requirement.", "Create a document inventory with source, issue date, expiry date, and verification status.", "Separate information you have confirmed from information you still need to verify.", "Search for employers that clearly describe international hiring, credentialing, or training support."],
    resourceHref: "/resources/licensure",
    resourceLabel: "Browse state licensure guidance",
  },
  {
    slug: "resident-to-early-career-physician",
    eyebrow: "Career advancement",
    title: "Resident to early-career physician",
    summary: "Move from training to an intentional first role by weighing practice setting, mentorship, compensation, and growth.",
    startingPoint: "For residents and fellows preparing to choose their first attending, faculty, hospital, or community-practice role.",
    transferableSkills: ["Clinical training", "Team-based care", "Teaching", "Evidence-based practice", "Complex case management"],
    options: [
      { title: "Academic or teaching practice", readiness: "Explore now", description: "A fit for physicians who want a mix of clinical care, teaching, research, and a defined academic community.", jobTitles: ["Academic Physician", "Assistant Professor", "Faculty Physician"] },
      { title: "Hospital or health-system practice", readiness: "Explore now", description: "Large systems can provide resources, colleagues, and structured pathways, with tradeoffs in autonomy and scope.", jobTitles: ["Attending Physician", "Hospitalist", "Employed Specialist"] },
      { title: "Community or private practice", readiness: "Explore now", description: "These roles can offer closer community ties and different autonomy, workload, and ownership considerations.", jobTitles: ["Community Physician", "Associate Physician", "Private Practice Physician"] },
    ],
    questions: ["Which setting supports the mentorship you want in your first three years?", "What schedule, call structure, and patient mix are sustainable for you?", "Which terms should be reviewed carefully before you sign?"],
    nextSteps: ["Build a role comparison sheet before interviews begin.", "Ask each employer about orientation, mentorship, call, scheduling, and support staff.", "Use an employment attorney or qualified adviser for contract-specific questions.", "Keep your professional profile and CV current as training milestones change."],
    resourceHref: "/resources/how-to-create-a-residency-application-timeline-that-works-for-you",
    resourceLabel: "Explore residency planning guidance",
  },
  {
    slug: "clinical-professional-to-clinical-research",
    eyebrow: "Career transition",
    title: "Clinical professional to clinical research",
    summary: "Use patient-care experience and attention to detail to move into study coordination, research operations, and clinical development.",
    startingPoint: "For clinicians and clinical support professionals interested in research without leaving healthcare behind.",
    transferableSkills: ["Patient interaction", "Clinical documentation", "Protocol awareness", "Privacy and ethics", "Careful coordination"],
    options: [
      { title: "Study coordination", readiness: "Explore now", description: "Coordination roles bring together participant support, scheduling, documentation, and communication across a study team.", jobTitles: ["Clinical Research Coordinator", "Research Nurse", "Study Coordinator"] },
      { title: "Research operations", readiness: "Develop in parallel", description: "Operations paths focus more on start-up, monitoring support, regulatory records, and sponsor or site coordination.", jobTitles: ["Clinical Trial Assistant", "Regulatory Coordinator", "Study Start-up Associate"] },
      { title: "Clinical development", readiness: "Longer-term option", description: "As experience grows, clinicians may move toward strategy, medical monitoring, or leadership in research programs.", jobTitles: ["Clinical Development Associate", "Medical Monitor", "Clinical Program Manager"] },
    ],
    questions: ["Do you prefer participant-facing work or behind-the-scenes research operations?", "Which research setting interests you: academic, hospital, CRO, or industry?", "What entry credential is actually required by your preferred employers?"],
    nextSteps: ["Read ten current research job descriptions and identify repeated skills.", "Ask your employer about research studies, quality projects, or investigator teams you can support.", "Show precision, privacy awareness, documentation, and patient communication clearly on your CV.", "Pursue foundational research training only if it closes a documented job requirement gap."],
  },
]

export function getCareerPath(slug: string) {
  return careerPaths.find((path) => path.slug === slug)
}
