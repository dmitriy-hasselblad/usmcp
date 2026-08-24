-- Store whether each career date is known to a year or to a month.
-- The date remains normalized to the first day of its month or year for ordering.

alter table public.professional_education
  add column start_date_precision text not null default 'month'
    check (start_date_precision in ('year', 'month')),
  add column end_date_precision text not null default 'month'
    check (end_date_precision in ('year', 'month'));

alter table public.professional_experience
  add column start_date_precision text not null default 'month'
    check (start_date_precision in ('year', 'month')),
  add column end_date_precision text not null default 'month'
    check (end_date_precision in ('year', 'month'));

alter table public.professional_licenses
  add column issued_on_precision text not null default 'month'
    check (issued_on_precision in ('year', 'month')),
  add column expires_on_precision text not null default 'month'
    check (expires_on_precision in ('year', 'month'));

alter table public.professional_certifications
  add column issued_on_precision text not null default 'month'
    check (issued_on_precision in ('year', 'month')),
  add column expires_on_precision text not null default 'month'
    check (expires_on_precision in ('year', 'month'));

grant insert (start_date_precision, end_date_precision)
on table public.professional_education to authenticated;
grant update (start_date_precision, end_date_precision)
on table public.professional_education to authenticated;

grant insert (start_date_precision, end_date_precision)
on table public.professional_experience to authenticated;
grant update (start_date_precision, end_date_precision)
on table public.professional_experience to authenticated;

grant insert (issued_on_precision, expires_on_precision)
on table public.professional_licenses to authenticated;
grant update (issued_on_precision, expires_on_precision)
on table public.professional_licenses to authenticated;

grant insert (issued_on_precision, expires_on_precision)
on table public.professional_certifications to authenticated;
grant update (issued_on_precision, expires_on_precision)
on table public.professional_certifications to authenticated;
