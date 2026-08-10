export const healthcareTaxonomy = {
  Physician: ["Allergy and Immunology", "Anesthesiology", "Cardiology", "Dermatology", "Emergency Medicine", "Family Medicine", "Gastroenterology", "General Surgery", "Internal Medicine", "Neurology", "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Orthopedic Surgery", "Pathology", "Pediatrics", "Psychiatry", "Radiology", "Urology"],
  "Registered Nurse": ["Ambulatory Care", "Cardiac Care", "Critical Care", "Emergency Nursing", "Home Health", "Labor and Delivery", "Medical-Surgical", "Mental Health", "Neonatal", "Oncology", "Operating Room", "Pediatrics", "Public Health"],
  "Advanced Practice Provider": ["Nurse Practitioner", "Physician Assistant", "Certified Registered Nurse Anesthetist", "Nurse Midwife"],
  Dentist: ["General Dentistry", "Dental Anesthesiology", "Endodontics", "Oral and Maxillofacial Surgery", "Orthodontics", "Pediatric Dentistry", "Periodontics", "Prosthodontics"],
  Pharmacist: ["Ambulatory Care", "Clinical Pharmacy", "Community Pharmacy", "Critical Care", "Infectious Diseases", "Oncology Pharmacy", "Pediatric Pharmacy", "Pharmacy Informatics"],
  Therapist: ["Physical Therapy", "Occupational Therapy", "Respiratory Therapy", "Speech-Language Pathology", "Recreational Therapy", "Behavioral Health Therapy"],
  "Technologist or Technician": ["Clinical Laboratory", "Dental Hygiene", "Diagnostic Medical Sonography", "MRI", "Medical Assistant", "Nuclear Medicine", "Pharmacy Technician", "Radiologic Technology", "Surgical Technology"],
  "Healthcare Administration": ["Clinical Operations", "Health Information Management", "Medical Practice Management", "Patient Access", "Quality and Safety", "Revenue Cycle"],
  "Healthcare Support": ["Certified Nursing Assistant", "Home Health Aide", "Medical Equipment Preparation", "Patient Care Technician", "Phlebotomy"],
  "Other Healthcare Professional": [],
} as const

export const healthcareProfessions = Object.keys(healthcareTaxonomy) as Array<keyof typeof healthcareTaxonomy>
export const legacyHealthcareProfessions = ["Nurse Practitioner", "Physician Assistant", "Allied Health Professional", "Healthcare Administrator", "Student or Trainee"] as const
export const otherSpecialtyValue = "__other__"

export function specialtiesForProfession(profession: string) {
  return healthcareTaxonomy[profession as keyof typeof healthcareTaxonomy] ?? []
}

export function isHealthcareProfession(value: string) {
  return healthcareProfessions.includes(value as keyof typeof healthcareTaxonomy) || legacyHealthcareProfessions.includes(value as never)
}
