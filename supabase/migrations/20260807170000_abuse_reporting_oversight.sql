-- Signed-in users may report only public marketplace content. Reports are
-- private to their author and active platform administrators.

create table public.abuse_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('job', 'organization', 'organization_post')),
  target_id uuid not null,
  category text not null check (category in ('inaccurate', 'inappropriate', 'spam', 'fraud', 'other')),
  details text not null check (char_length(details) between 20 and 2000),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolution_note text check (resolution_note is null or char_length(resolution_note) between 2 and 1000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index abuse_reports_status_created_at_idx
on public.abuse_reports (status, created_at desc);

create index abuse_reports_target_created_at_idx
on public.abuse_reports (target_type, target_id, created_at desc);

create unique index abuse_reports_one_open_category_idx
on public.abuse_reports (reporter_id, target_type, target_id, category)
where status = 'open';

alter table public.abuse_reports enable row level security;

create or replace function private.is_public_report_target(
  report_target_type text,
  report_target_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case report_target_type
    when 'job' then exists (
      select 1 from public.jobs
      where id = report_target_id
        and status = 'published'
        and moderation_status = 'approved'
    )
    when 'organization' then exists (
      select 1 from public.organizations
      where id = report_target_id
        and exists (
          select 1 from public.jobs
          where jobs.organization_id = organizations.id
            and jobs.status = 'published'
            and jobs.moderation_status = 'approved'
        )
    )
    when 'organization_post' then exists (
      select 1 from public.organization_posts
      where id = report_target_id
        and status = 'published'
        and moderation_status = 'approved'
    )
    else false
  end;
$$;

revoke all on function private.is_public_report_target(text, uuid)
from public, anon, authenticated;
grant execute on function private.is_public_report_target(text, uuid)
to authenticated;

create policy "Reporters can read their abuse reports"
on public.abuse_reports for select to authenticated
using (reporter_id = (select auth.uid()));

create policy "Authenticated users can submit public content reports"
on public.abuse_reports for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'open'
  and reviewed_by is null
  and reviewed_at is null
  and resolution_note is null
  and private.is_public_report_target(target_type, target_id)
);

create policy "Platform admins can read abuse reports"
on public.abuse_reports for select to authenticated
using (private.is_platform_admin());

revoke all on table public.abuse_reports from public, anon, authenticated;
grant select on table public.abuse_reports to authenticated;
grant insert (reporter_id, target_type, target_id, category, details)
on table public.abuse_reports to authenticated;

create or replace function private.set_abuse_report_status(
  target_report_id uuid,
  target_status text,
  target_resolution_note text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_status text;
  normalized_note text := nullif(trim(target_resolution_note), '');
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then
    raise exception 'Platform administrator access is required.';
  end if;
  if target_status not in ('resolved', 'dismissed') then
    raise exception 'Unsupported report status.';
  end if;
  if coalesce(char_length(normalized_note), 0) < 2 then
    raise exception 'A resolution note is required.';
  end if;

  select status into previous_status from public.abuse_reports
  where id = target_report_id for update;
  if previous_status is null then raise exception 'Report not found.'; end if;
  if previous_status <> 'open' then raise exception 'Only open reports can be reviewed.'; end if;

  update public.abuse_reports
  set status = target_status,
      resolution_note = normalized_note,
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = target_report_id;

  perform private.record_admin_audit_event(
    'abuse_report.status_changed', 'abuse_report', target_report_id,
    jsonb_build_object('previous_status', previous_status, 'new_status', target_status)
  );
  return target_status;
end;
$$;

revoke all on function private.set_abuse_report_status(uuid, text, text)
from public, anon, authenticated;

create or replace function public.set_abuse_report_status(
  target_report_id uuid,
  target_status text,
  target_resolution_note text default null
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.set_abuse_report_status(target_report_id, target_status, target_resolution_note);
$$;

revoke all on function public.set_abuse_report_status(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.set_abuse_report_status(uuid, text, text) to authenticated;
