-- Job managers already pass ownership checks through RLS. These grants only
-- complete the column-level permission set needed for editing a job.
grant update (
  workplace_type,
  required_skills,
  posting_duration_days,
  open_positions,
  employment_arrangement,
  new_graduates_welcome,
  licensure_requirement,
  care_settings,
  relocation_support,
  visa_sponsorship_status,
  visa_pathways
) on table public.jobs to authenticated;
