-- Keep professional ownership columns immutable through the Data API.

revoke insert, update on table public.professional_education from authenticated;
revoke insert, update on table public.professional_experience from authenticated;
revoke insert, update on table public.professional_licenses from authenticated;
revoke insert, update on table public.professional_certifications from authenticated;

grant insert (
  user_id,
  education_type,
  institution,
  program,
  specialty,
  city,
  state_code,
  country,
  start_date,
  end_date,
  is_current,
  description
) on table public.professional_education to authenticated;

grant update (
  education_type,
  institution,
  program,
  specialty,
  city,
  state_code,
  country,
  start_date,
  end_date,
  is_current,
  description
) on table public.professional_education to authenticated;

grant insert (
  user_id,
  organization_name,
  role_title,
  employment_type,
  city,
  state_code,
  start_date,
  end_date,
  is_current,
  description
) on table public.professional_experience to authenticated;

grant update (
  organization_name,
  role_title,
  employment_type,
  city,
  state_code,
  start_date,
  end_date,
  is_current,
  description
) on table public.professional_experience to authenticated;

grant insert (
  user_id,
  license_type,
  license_number,
  issuing_state,
  issued_on,
  expires_on
) on table public.professional_licenses to authenticated;

grant update (
  license_type,
  license_number,
  issuing_state,
  issued_on,
  expires_on
) on table public.professional_licenses to authenticated;

grant insert (
  user_id,
  name,
  issuing_organization,
  credential_id,
  issued_on,
  expires_on
) on table public.professional_certifications to authenticated;

grant update (
  name,
  issuing_organization,
  credential_id,
  issued_on,
  expires_on
) on table public.professional_certifications to authenticated;
