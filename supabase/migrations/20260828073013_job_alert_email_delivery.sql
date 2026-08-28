-- Optional email delivery for professional-controlled saved job alerts.
-- In-product alerts remain enabled independently. Email starts opt-in only.

alter table public.saved_job_searches
add column email_alerts_enabled boolean not null default false;

comment on column public.saved_job_searches.email_alerts_enabled is
  'Professional-controlled opt-in for transactional emails about new saved-search matches.';
