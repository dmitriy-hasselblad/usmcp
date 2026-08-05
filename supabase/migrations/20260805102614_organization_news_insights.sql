-- Organization-authored News & Insights with moderation and private images.

create table public.organization_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  slug text not null unique check (char_length(slug) between 3 and 180 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 5 and 180),
  excerpt text not null check (char_length(excerpt) between 20 and 360),
  body text not null check (char_length(body) between 100 and 30000),
  cover_image_path text check (cover_image_path is null or char_length(cover_image_path) <= 500),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'published')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'blocked')),
  moderation_reason text check (moderation_reason is null or char_length(moderation_reason) <= 1000),
  moderated_at timestamptz,
  moderated_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create index organization_posts_organization_created_idx on public.organization_posts (organization_id, created_at desc);
create index organization_posts_public_idx on public.organization_posts (published_at desc) where status = 'published' and moderation_status = 'approved';
create trigger organization_posts_set_updated_at before update on public.organization_posts for each row execute function private.set_updated_at();
alter table public.organization_posts enable row level security;

create policy "Organization members can read their posts" on public.organization_posts
for select to authenticated using (private.is_organization_member(organization_id));
create policy "Hiring teams can create posts" on public.organization_posts
for insert to authenticated with check (
  author_id = (select auth.uid()) and status in ('draft', 'submitted') and moderation_status = 'pending'
  and private.is_organization_member(organization_id, array['owner','admin','recruiter']::public.organization_member_role[])
);
create policy "Hiring teams can update posts" on public.organization_posts
for update to authenticated
using (private.is_organization_member(organization_id, array['owner','admin','recruiter']::public.organization_member_role[]))
with check (private.is_organization_member(organization_id, array['owner','admin','recruiter']::public.organization_member_role[]));
create policy "Organization managers can delete posts" on public.organization_posts
for delete to authenticated using (private.is_organization_member(organization_id, array['owner','admin']::public.organization_member_role[]));
create policy "Public can read approved organization posts" on public.organization_posts
for select to anon, authenticated using (
  status = 'published' and moderation_status = 'approved'
  and exists (select 1 from public.organizations where organizations.id = organization_posts.organization_id and organizations.verification_status = 'verified')
);
create policy "Platform admins can read organization posts" on public.organization_posts
for select to authenticated using (private.is_platform_admin());

revoke all on table public.organization_posts from anon, authenticated;
grant select on table public.organization_posts to anon, authenticated;
grant insert (organization_id, author_id, slug, title, excerpt, body, cover_image_path, status) on table public.organization_posts to authenticated;
grant update (title, excerpt, body, cover_image_path, status, published_at) on table public.organization_posts to authenticated;
grant delete on table public.organization_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('organization-news', 'organization-news', false, 8388608, array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Organization hiring teams can read news images" on storage.objects
for select to authenticated using (
  bucket_id = 'organization-news'
  and private.is_organization_member(((storage.foldername(name))[1])::uuid, array['owner','admin','recruiter']::public.organization_member_role[])
);
create policy "Public can read approved news images" on storage.objects
for select to anon, authenticated using (
  bucket_id = 'organization-news'
  and exists (
    select 1 from public.organization_posts
    join public.organizations on organizations.id = organization_posts.organization_id
    where organization_posts.cover_image_path = storage.objects.name
      and organization_posts.status = 'published'
      and organization_posts.moderation_status = 'approved'
      and organizations.verification_status = 'verified'
  )
);
create policy "Organization hiring teams can upload news images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'organization-news'
  and private.is_organization_member(((storage.foldername(name))[1])::uuid, array['owner','admin','recruiter']::public.organization_member_role[])
);
create policy "Organization hiring teams can replace news images" on storage.objects
for update to authenticated
using (bucket_id = 'organization-news' and private.is_organization_member(((storage.foldername(name))[1])::uuid, array['owner','admin','recruiter']::public.organization_member_role[]))
with check (bucket_id = 'organization-news' and private.is_organization_member(((storage.foldername(name))[1])::uuid, array['owner','admin','recruiter']::public.organization_member_role[]));
create policy "Organization managers can delete news images" on storage.objects
for delete to authenticated using (
  bucket_id = 'organization-news'
  and private.is_organization_member(((storage.foldername(name))[1])::uuid, array['owner','admin']::public.organization_member_role[])
);

create or replace function private.set_organization_post_moderation(target_post_id uuid, target_status text, moderation_reason text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare previous_status text; normalized_reason text := nullif(trim(moderation_reason), '');
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Platform administrator access is required.'; end if;
  if target_status not in ('approved','blocked') then raise exception 'Unsupported moderation status.'; end if;
  if normalized_reason is not null and char_length(normalized_reason) > 1000 then raise exception 'The moderation note is too long.'; end if;
  if target_status = 'blocked' and coalesce(char_length(normalized_reason), 0) < 10 then raise exception 'A blocking reason of at least 10 characters is required.'; end if;
  select moderation_status into previous_status from public.organization_posts where id = target_post_id for update;
  if previous_status is null then raise exception 'Article not found.'; end if;
  update public.organization_posts set
    moderation_status = target_status, moderation_reason = normalized_reason,
    moderated_at = now(), moderated_by = (select auth.uid()),
    status = case when target_status = 'approved' then 'published' else status end,
    published_at = case when target_status = 'approved' then coalesce(published_at, now()) else published_at end
  where id = target_post_id;
  perform private.record_admin_audit_event('organization_post.moderation_status_changed', 'organization_post', target_post_id,
    jsonb_build_object('previous_status', previous_status, 'new_status', target_status, 'reason', normalized_reason));
  return target_status;
end;
$$;
revoke all on function private.set_organization_post_moderation(uuid,text,text) from public, anon, authenticated;
grant execute on function private.set_organization_post_moderation(uuid,text,text) to authenticated;

create or replace function public.set_organization_post_moderation(target_post_id uuid, target_status text, moderation_reason text default null)
returns text language sql security invoker set search_path = '' as $$
  select private.set_organization_post_moderation(target_post_id, target_status, moderation_reason);
$$;
revoke all on function public.set_organization_post_moderation(uuid,text,text) from public, anon, authenticated;
grant execute on function public.set_organization_post_moderation(uuid,text,text) to authenticated;
