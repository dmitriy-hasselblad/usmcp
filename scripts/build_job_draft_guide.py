from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = "public/guides/create-job-draft-guide.pdf"

NAVY = colors.HexColor("#0c2340")
BLUE = colors.HexColor("#1e5c8d")
TEAL = colors.HexColor("#008f8a")
PALE_BLUE = colors.HexColor("#eef6fb")
PALE_TEAL = colors.HexColor("#e8f7f5")
TEXT = colors.HexColor("#26384c")
MUTED = colors.HexColor("#58708b")
LINE = colors.HexColor("#d7e2ec")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="GuideTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=26, leading=30, textColor=NAVY, spaceAfter=7))
styles.add(ParagraphStyle(name="GuideSubtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=12, leading=18, textColor=MUTED, spaceAfter=18))
styles.add(ParagraphStyle(name="GuideH1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=NAVY, spaceBefore=20, spaceAfter=8, keepWithNext=True))
styles.add(ParagraphStyle(name="GuideH2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=BLUE, spaceBefore=13, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="GuideBody", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.7, leading=14.2, textColor=TEXT, spaceAfter=7))
styles.add(ParagraphStyle(name="GuideSmall", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="GuideLabel", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=9.1, leading=12.5, textColor=NAVY, spaceAfter=2))
styles.add(ParagraphStyle(name="GuideNote", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.4, leading=13.5, textColor=TEXT, leftIndent=9, rightIndent=9, spaceBefore=5, spaceAfter=8))

def p(text, style="GuideBody"):
    return Paragraph(text, styles[style])

def bullets(items):
    return ListFlowable(
        [ListItem(p(item, "GuideBody"), leftIndent=12) for item in items],
        bulletType="bullet", start="circle", leftIndent=17, bulletFontSize=6,
        spaceAfter=8,
    )

def note(title, text):
    table = Table([[p(f"<b>{title}</b><br/>{text}", "GuideNote")]], colWidths=[6.65 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_TEAL),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#b9e1dd")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table

def field(name, required, meaning, how_to, example=None):
    pieces = [p(f"{name} {'Required' if required else 'Optional'}", "GuideH2"), p(f"<b>What it controls:</b> {meaning}"), p(f"<b>How to complete it:</b> {how_to}")]
    if example:
        pieces.append(p(f"<b>Example:</b> {example}", "GuideSmall"))
    return KeepTogether(pieces)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, 0.58 * inch, letter[0] - doc.rightMargin, 0.58 * inch)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(doc.leftMargin, 0.38 * inch, "SM VIA Employer Guide")
    canvas.drawRightString(letter[0] - doc.rightMargin, 0.38 * inch, f"Page {doc.page}")
    canvas.restoreState()

def build():
    doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.78 * inch, rightMargin=0.78 * inch, topMargin=0.72 * inch, bottomMargin=0.78 * inch, title="Create a Job Draft Guide", author="SM VIA")
    story = []
    story += [p("SM VIA Employer Guide", "GuideSmall"), p("How to create a job draft", "GuideTitle"), p("A field by field guide for creating a clear, accurate healthcare opportunity in your employer workspace.", "GuideSubtitle")]
    story.append(note("Purpose", "Use this guide while creating or editing a job. It explains what every field means, what candidates see, and when to leave an optional field blank. A job is saved as a private draft first; you can review it before publishing."))

    story += [p("Before you begin", "GuideH1"), p("Have the approved job title, hiring location, employment arrangement, compensation information, licensure expectations, and a current job description ready. Use only information that your organization can support. Do not promise licensure, immigration, compensation, or benefits that have not been approved."), bullets([
        "Use a specific job title that candidates would recognize.",
        "Describe the actual location and work arrangement for this opening.",
        "State requirements accurately and distinguish required qualifications from preferences.",
        "Use neutral, inclusive language and avoid personal contact information in the job description.",
    ])]

    story += [p("Draft and publishing status", "GuideH1"), p("When you select <b>Save job draft</b>, SM VIA creates a private record visible only to authorized members of your organization workspace. Saving a draft does not publish the role to candidates."), p("After reviewing the record in Jobs, an authorized employer user can publish it. The selected posting duration starts when the role is published. When that period ends, the job stops accepting applications and appears in the expired jobs list."), note("Important", "Publishing makes the job ready for the marketplace workflow. Review every field, especially title, location, compensation, license requirement, and description, before publishing.")]

    story += [p("Core job details", "GuideH1")]
    story += [field("Job title", True, "The headline candidates see in search results, job cards, and the job page.", "Use the actual role title. Do not put salary, location, marketing language, or internal requisition codes in this field.", "Registered Nurse (RN), Ambulatory Care"),
        field("Healthcare category", True, "Groups the role within a broad healthcare area and determines the available profession choices.", "Choose the category that most closely matches the primary work of the role. Use the role's clinical function, not the department name alone.", "Nursing"),
        field("Profession", True, "Identifies the primary profession for candidate search and recommendations.", "Choose the profession that matches the person you are hiring. Do not select a broader profession simply to receive more applicants.", "Registered Nurse"),
        field("Specialty or department", False, "Adds clinical context beyond the profession and helps candidates understand the care area.", "Select the relevant specialty or department when one applies. Leave it blank if the role is truly general.", "Ambulatory Care"),
        field("Experience level", True, "Communicates the seniority expected for the position.", "Choose Entry level when a new professional can reasonably be considered; choose Mid level, Senior level, or Executive when the role requires that level of responsibility. Choose Not specified only if no level can be stated accurately."),
        field("Primary U.S. state", True, "Sets the main state for the job, search filters, state map, and licensure context.", "Choose the state where the professional will primarily work. For remote roles, choose the state of the employing location or the primary work jurisdiction your organization has approved."),
        field("City", True, "Shows the local hiring location to candidates.", "Choose a suggested city or enter the actual U.S. city. Use one consistent location rather than a metro-area description.", "Denver")]

    story += [p("Work arrangement and vacancy details", "GuideH1")]
    story += [field("Employment type", True, "Describes the employment relationship and expected schedule category.", "Select Full-time, Part-time, Contract, Temporary, or Per diem based on the approved opening. Use the job description for schedule details."),
        field("Workplace type", True, "Tells candidates whether the role is On-site, Hybrid, or Remote.", "Choose On-site when work is normally performed at a facility, Hybrid when scheduled work includes both a facility and remote work, and Remote only when the role may be performed remotely as advertised."),
        field("Posting duration", True, "Sets how long the job accepts applications after publication.", "Choose 30, 60, or 90 days. Thirty days is recommended for a standard opening. The countdown does not start while the job is a draft."),
        field("Open positions", True, "Shows how many people the organization is hiring for this role.", "Enter a whole number from 1 to 250. Each confirmed hire reduces this count automatically, so update it if your staffing plan changes.", "3"),
        field("Required skills", False, "Supports transparent candidate recommendations and gives candidates a concise view of important practical skills.", "Enter distinct skills separated by commas. Use specific, job-relevant terms. Do not repeat the whole job description or enter credentials that belong in the licensure field.", "Epic, ACLS, patient assessment")]

    story += [p("Hiring licensure and mobility", "GuideH1"), p("This section helps candidates assess basic eligibility before they apply. It should describe the current hiring policy for this role, not legal advice or a guarantee of an outcome.")]
    story += [field("Employment arrangement", True, "Clarifies the hiring relationship, such as direct employment, contractor work, or agency placement.", "Choose W-2 direct hire when the organization hires the candidate directly as an employee. Choose 1099 independent contractor or Agency placement only when that reflects the actual arrangement. Use Other only when none of the listed options is accurate."),
        field("License requirement", True, "Explains the level of licensure expected at the time of application or hire.", "Choose Active state license required when an active license is mandatory. Choose Eligible to obtain a state license when candidates may apply before receiving the license. Choose Compact license preferred only when it is genuinely preferred, not mandatory."),
        field("Care settings", False, "Adds the clinical environments relevant to the work.", "Select every setting that materially applies. Do not select settings merely to broaden search visibility.", "Ambulatory / outpatient; Telehealth"),
        field("New graduates welcome", False, "Signals that candidates without prior post-licensure experience can be considered.", "Select this only if the hiring team can assess and hire qualified new graduates for this exact role. Leave it unchecked when prior experience is required."),
        field("Relocation assistance", True, "Shows whether relocation support is not offered, may be available, or is available.", "Choose Available only for a program the organization can provide. Choose May be available when eligibility depends on factors such as location, specialty, or approval. Explain material terms in the job description if appropriate."),
        field("Visa sponsorship", True, "Communicates whether immigration sponsorship is not offered, may be considered, or available.", "Use May be considered if each case requires employer review. Use Available only when the organization has a current program for the role. Never treat this field as an immigration guarantee."),
        field("Possible visa pathways", False, "Lets you name pathways the organization may consider for this role.", "Select a pathway only when it aligns with your approved hiring practice and only when Visa sponsorship is not Not offered. SM VIA limits this field to H-1B, Employment-based permanent residence, and Other. Individual eligibility must still be evaluated separately.")]

    story += [p("Compensation", "GuideH1")]
    story += [field("Minimum compensation", False, "Shows the lower end of the approved pay range.", "Enter a non-negative number without currency symbols or commas. Leave blank only if you are not publishing a range.", "86000"),
        field("Maximum compensation", False, "Shows the upper end of the approved pay range.", "Enter a non-negative number that is equal to or greater than the minimum. If both values are entered, candidates see a range.", "92000"),
        field("Salary period", True, "Defines whether the entered compensation is annual or hourly.", "Select Per year for annual pay and Per hour for hourly pay. Verify the period matches both numbers before saving."),
        note("Pay accuracy", "Use only approved compensation information. If the role has a range, ensure the numbers and period match the employer's current compensation policy.")]

    story += [p("Job description", "GuideH1"), p("The job description is the main detailed explanation candidates read. The editor supports bold text, H2 and H3 headings, bulleted lists, and numbered lists. Clear headings and short lists make the job easier to scan."),
        p("A strong healthcare job description normally includes the following sections:"), bullets([
            "About the role: one short paragraph explaining the patient population, setting, and purpose of the position.",
            "Responsibilities: the core duties the hired person will perform.",
            "Requirements: essential qualifications, credentials, experience, and certifications.",
            "Preferred qualifications: items that help a candidate stand out but are not mandatory.",
            "What we offer: approved benefits, schedule context, learning support, and team environment.",
            "Application notes: only necessary next steps or timing information. Do not add personal email addresses or ask candidates to send sensitive information outside SM VIA.",
        ]),
        note("Formatting tip", "Use H2 for main sections such as Responsibilities and Requirements. Use bulleted lists for duties and qualifications. Do not paste text from a document with hidden formatting; paste as plain text, then apply headings and lists in the editor."),
        p("The description can be up to 10,000 characters. Save the draft, review the public-facing preview after publication, and edit the job when information changes.")]

    story += [p("Review checklist before publishing", "GuideH1"), bullets([
        "The title, profession, specialty, state, city, employment type, and workplace type describe the same role.",
        "The posting duration and number of open positions are correct.",
        "Licensure, new graduate, relocation, and visa statements match the employer's approved policy.",
        "Compensation is accurate, internally approved, and uses the correct period.",
        "The description separates requirements from preferences and does not promise an outcome that depends on individual review.",
        "No personal applicant information, private links, or unapproved contact details are included.",
    ]), p("Need help? Keep the job as a draft and review it with your hiring lead before publishing. A draft can be edited without being visible to candidates.")]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)

if __name__ == "__main__":
    build()
