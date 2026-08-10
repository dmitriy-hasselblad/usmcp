type Profession = { name: string; specialties: readonly string[] }
type Category = { name: string; professions: readonly Profession[] }

// A practical U.S. healthcare taxonomy for selection fields. Categories keep the
// experience manageable; the stored values remain profession and specialty.
export const healthcareTaxonomy: readonly Category[] = [
  { name: "Physicians and surgeons", professions: [
    { name: "Physician", specialties: ["Allergy and Immunology", "Anesthesiology", "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology", "Family Medicine", "Gastroenterology", "General Surgery", "Hematology", "Hospital Medicine", "Infectious Diseases", "Internal Medicine", "Nephrology", "Neurology", "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Orthopedic Surgery", "Otolaryngology", "Pathology", "Pediatrics", "Physical Medicine and Rehabilitation", "Plastic Surgery", "Psychiatry", "Pulmonology", "Radiology", "Rheumatology", "Urology"] },
    { name: "Podiatrist", specialties: ["Foot and Ankle Surgery", "Sports Medicine", "Wound Care"] },
    { name: "Chiropractor", specialties: ["Sports Chiropractic", "Rehabilitation", "General Chiropractic"] },
  ] },
  { name: "Nursing", professions: [
    { name: "Registered Nurse", specialties: ["Ambulatory Care", "Cardiac Care", "Critical Care", "Emergency Nursing", "Home Health", "Labor and Delivery", "Medical-Surgical", "Mental Health", "Neonatal", "Oncology", "Operating Room", "Pediatrics", "Perioperative", "Public Health", "School Nursing"] },
    { name: "Licensed Practical or Vocational Nurse", specialties: ["Long-Term Care", "Home Health", "Outpatient Care", "Pediatrics"] },
    { name: "Nurse Manager or Executive", specialties: ["Clinical Operations", "Patient Safety", "Quality Improvement", "Nursing Informatics"] },
  ] },
  { name: "Advanced practice", professions: [
    { name: "Nurse Practitioner", specialties: ["Adult-Gerontology", "Family", "Neonatal", "Pediatric", "Psychiatric-Mental Health", "Women’s Health", "Acute Care"] },
    { name: "Physician Associate", specialties: ["Emergency Medicine", "Family Medicine", "Internal Medicine", "Orthopedics", "Surgery", "Psychiatry", "Pediatrics"] },
    { name: "Certified Registered Nurse Anesthetist", specialties: ["General Anesthesia", "Cardiac Anesthesia", "Pediatric Anesthesia", "Pain Management"] },
    { name: "Certified Nurse Midwife", specialties: ["Antepartum Care", "Labor and Delivery", "Postpartum Care", "Women’s Health"] },
    { name: "Clinical Nurse Specialist", specialties: ["Adult-Gerontology", "Critical Care", "Oncology", "Pediatrics", "Psychiatric-Mental Health"] },
  ] },
  { name: "Dentistry and oral health", professions: [
    { name: "Dentist", specialties: ["General Dentistry", "Dental Anesthesiology", "Dental Public Health", "Endodontics", "Oral and Maxillofacial Pathology", "Oral and Maxillofacial Radiology", "Oral and Maxillofacial Surgery", "Oral Medicine", "Orofacial Pain", "Orthodontics", "Pediatric Dentistry", "Periodontics", "Prosthodontics"] },
    { name: "Dental Hygienist", specialties: ["Periodontal Care", "Pediatric Dentistry", "Public Health", "General Dentistry"] },
    { name: "Dental Assistant", specialties: ["Expanded Functions", "Orthodontics", "Oral Surgery", "General Dentistry"] },
    { name: "Dental Laboratory Technician", specialties: ["Crown and Bridge", "Ceramics", "Orthodontics", "Removable Prosthetics"] },
  ] },
  { name: "Pharmacy", professions: [
    { name: "Pharmacist", specialties: ["Ambulatory Care", "Cardiology", "Community Pharmacy", "Critical Care", "Emergency Medicine", "Geriatrics", "Infectious Diseases", "Oncology Pharmacy", "Pediatric Pharmacy", "Pharmacy Informatics", "Psychiatric Pharmacy", "Transplant Pharmacy"] },
    { name: "Pharmacy Technician", specialties: ["Compounding", "Hospital Pharmacy", "Retail Pharmacy", "Sterile Products", "Medication History"] },
  ] },
  { name: "Behavioral and mental health", professions: [
    { name: "Psychologist", specialties: ["Clinical Psychology", "Counseling Psychology", "Neuropsychology", "School Psychology", "Health Psychology"] },
    { name: "Licensed Clinical Social Worker", specialties: ["Behavioral Health", "Child and Family", "Medical Social Work", "Substance Use Treatment"] },
    { name: "Mental Health Counselor", specialties: ["Addiction Counseling", "Clinical Mental Health", "Marriage and Family Therapy", "School Counseling"] },
    { name: "Behavior Analyst", specialties: ["Applied Behavior Analysis", "Autism Services", "Developmental Disabilities"] },
    { name: "Substance Use Counselor", specialties: ["Outpatient Treatment", "Residential Treatment", "Recovery Support"] },
  ] },
  { name: "Therapy and rehabilitation", professions: [
    { name: "Physical Therapist", specialties: ["Acute Care", "Geriatrics", "Neurology", "Orthopedics", "Pediatrics", "Sports", "Women’s Health"] },
    { name: "Occupational Therapist", specialties: ["Hand Therapy", "Mental Health", "Pediatrics", "Rehabilitation", "School-Based Therapy"] },
    { name: "Respiratory Therapist", specialties: ["Adult Critical Care", "Neonatal and Pediatric", "Pulmonary Rehabilitation", "Sleep Medicine"] },
    { name: "Speech-Language Pathologist", specialties: ["Adult Medical", "Dysphagia", "Pediatrics", "Voice and Fluency"] },
    { name: "Audiologist", specialties: ["Diagnostic Audiology", "Hearing Aids", "Pediatric Audiology", "Vestibular Care"] },
    { name: "Recreational Therapist", specialties: ["Behavioral Health", "Geriatrics", "Physical Rehabilitation"] },
    { name: "Massage Therapist", specialties: ["Medical Massage", "Sports Massage", "Oncology Massage"] },
  ] },
  { name: "Diagnostic, laboratory, and imaging", professions: [
    { name: "Clinical Laboratory Scientist", specialties: ["Blood Bank", "Chemistry", "Hematology", "Microbiology", "Molecular Diagnostics"] },
    { name: "Clinical Laboratory Technician", specialties: ["Phlebotomy", "Specimen Processing", "General Laboratory"] },
    { name: "Pathologists’ Assistant", specialties: ["Anatomic Pathology", "Surgical Pathology"] },
    { name: "Radiologic Technologist", specialties: ["Computed Tomography", "Interventional Radiology", "Mammography", "Radiography"] },
    { name: "Magnetic Resonance Imaging Technologist", specialties: ["Cardiac MRI", "Neuro MRI", "Musculoskeletal MRI"] },
    { name: "Diagnostic Medical Sonographer", specialties: ["Abdominal", "Cardiac", "Obstetric and Gynecologic", "Vascular"] },
    { name: "Nuclear Medicine Technologist", specialties: ["PET/CT", "Cardiology", "Therapeutic Nuclear Medicine"] },
  ] },
  { name: "Emergency, surgical, and patient care", professions: [
    { name: "Paramedic", specialties: ["Critical Care Transport", "Emergency Medical Services", "Flight Medicine"] },
    { name: "Emergency Medical Technician", specialties: ["Basic Life Support", "Emergency Medical Services", "Event Medicine"] },
    { name: "Surgical Technologist", specialties: ["Cardiovascular Surgery", "General Surgery", "Neurosurgery", "Orthopedics"] },
    { name: "Medical Assistant", specialties: ["Family Medicine", "Pediatrics", "Specialty Clinic", "Urgent Care"] },
    { name: "Patient Care Technician", specialties: ["Dialysis", "Emergency Department", "Inpatient Care"] },
    { name: "Certified Nursing Assistant", specialties: ["Home Health", "Long-Term Care", "Hospital Care"] },
    { name: "Phlebotomist", specialties: ["Blood Donation", "Hospital Laboratory", "Mobile Phlebotomy"] },
  ] },
  { name: "Health information and clinical technology", professions: [
    { name: "Health Information Technician", specialties: ["Coding", "Medical Records", "Release of Information"] },
    { name: "Medical Coder", specialties: ["CPC", "Hospital Coding", "Risk Adjustment"] },
    { name: "Clinical Informatics Specialist", specialties: ["Electronic Health Records", "Clinical Decision Support", "Data Analytics"] },
    { name: "Medical Transcriptionist", specialties: ["Radiology", "Acute Care", "Specialty Practice"] },
  ] },
  { name: "Administration and operations", professions: [
    { name: "Healthcare Administrator", specialties: ["Clinical Operations", "Health System Leadership", "Long-Term Care", "Medical Practice Management"] },
    { name: "Medical and Health Services Manager", specialties: ["Ambulatory Operations", "Hospital Operations", "Quality and Safety", "Revenue Cycle"] },
    { name: "Patient Access Representative", specialties: ["Insurance Verification", "Registration", "Scheduling"] },
    { name: "Medical Biller", specialties: ["Claims", "Revenue Cycle", "Prior Authorization"] },
    { name: "Healthcare Recruiter", specialties: ["Clinical Recruitment", "Physician Recruitment", "Travel Staffing"] },
  ] },
  { name: "Public health, research, and education", professions: [
    { name: "Epidemiologist", specialties: ["Communicable Disease", "Chronic Disease", "Infection Prevention"] },
    { name: "Public Health Professional", specialties: ["Community Health", "Health Education", "Maternal and Child Health", "Preparedness"] },
    { name: "Clinical Research Coordinator", specialties: ["Clinical Trials", "Oncology Research", "Regulatory Affairs"] },
    { name: "Biostatistician", specialties: ["Clinical Research", "Population Health", "Real-World Evidence"] },
    { name: "Healthcare Educator", specialties: ["Clinical Education", "Nursing Education", "Patient Education"] },
  ] },
  { name: "Other healthcare roles", professions: [
    { name: "Healthcare Support Professional", specialties: ["Environmental Services", "Home Health Aide", "Medical Equipment Preparation", "Patient Transport"] },
    { name: "Student or Trainee", specialties: ["Medical Student", "Nursing Student", "Resident Physician", "Fellow Physician"] },
    { name: "Other Healthcare Professional", specialties: [] },
  ] },
] as const

export const legacyHealthcareProfessions = ["Advanced Practice Provider", "Physician Assistant", "Allied Health Professional", "Healthcare Administration", "Healthcare Support", "Technologist or Technician", "Therapist"] as const
export const otherSpecialtyValue = "__other__"

export const healthcareCategories = healthcareTaxonomy.map((category) => category.name)
export const healthcareProfessions = healthcareTaxonomy.flatMap((category) => category.professions.map((profession) => profession.name))

const professionIndex = new Map(healthcareTaxonomy.flatMap((category) => category.professions.map((profession) => [profession.name, { ...profession, category: category.name }] as const)))
const legacyCategoryMap: Record<string, string> = {
  "Advanced Practice Provider": "Advanced practice",
  "Physician Assistant": "Advanced practice",
  "Allied Health Professional": "Other healthcare roles",
  "Healthcare Administration": "Administration and operations",
  "Healthcare Support": "Other healthcare roles",
  "Technologist or Technician": "Diagnostic, laboratory, and imaging",
  Therapist: "Therapy and rehabilitation",
}

export function professionsForCategory(category: string) {
  return healthcareTaxonomy.find((item) => item.name === category)?.professions ?? []
}

export function categoryForProfession(profession: string) {
  return professionIndex.get(profession)?.category ?? legacyCategoryMap[profession] ?? ""
}

export function specialtiesForProfession(profession: string) {
  return professionIndex.get(profession)?.specialties ?? []
}

export function isHealthcareProfession(value: string) {
  return professionIndex.has(value) || legacyHealthcareProfessions.includes(value as never)
}
