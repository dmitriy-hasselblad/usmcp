create table public.professional_cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Cover letter' check (char_length(title) between 1 and 120),
  content jsonb not null default '{}'::jsonb check (
    jsonb_typeof(content) = 'object'
    and octet_length(content::text) <= 100000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index professional_cover_letters_user_updated_idx
on public.professional_cover_letters (user_id, updated_at desc);

create trigger professional_cover_letters_set_updated_at
before update on public.professional_cover_letters
for each row execute function private.set_updated_at();

alter table public.professional_cover_letters enable row level security;

create policy "Professionals read their private cover letters"
on public.professional_cover_letters for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Professionals create their private cover letters"
on public.professional_cover_letters for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.account_type = 'professional'
      and profiles.onboarding_completed
  )
);

create policy "Professionals update their private cover letters"
on public.professional_cover_letters for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Professionals delete their private cover letters"
on public.professional_cover_letters for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.professional_cover_letters from public, anon, authenticated;
grant select, insert, update, delete on table public.professional_cover_letters to authenticated;
