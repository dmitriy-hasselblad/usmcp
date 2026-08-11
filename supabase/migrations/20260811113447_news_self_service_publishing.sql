-- Self-service organization publishing with reversible removal and an immutable history.

alter table public.organization_posts
  drop constraint organization_posts_status_check;

alter table public.organization_posts
  add constraint organization_posts_status_check
  check (status in ('draft', 'submitted', 'published', 'archived'));

alter table public.organization_posts
  add column archived_at timestamptz,
  add column archived_by uuid references public.profiles (id) on delete set null;

create index organization_posts_organization_status_created_idx
  on public.organization_posts (organization_id, status, created_at desc);
create index organization_posts_author_id_idx
  on public.organization_posts (author_id);
create index organization_posts_archived_by_idx
  on public.organization_posts (archived_by)
  where archived_by is not null;

create table public.organization_post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.organization_posts (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null check (action in ('created', 'updated', 'published', 'archived', 'restored', 'blocked', 'moderation_updated')),
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index organization_post_revisions_post_created_idx
  on public.organization_post_revisions (post_id, created_at desc);
create index organization_post_revisions_organization_created_idx
  on public.organization_post_revisions (organization_id, created_at desc);
create index organization_post_revisions_actor_id_idx
  on public.organization_post_revisions (actor_id)
  where actor_id is not null;

alter table public.organization_post_revisions enable row level security;

create policy "Organization members can read post history"
on public.organization_post_revisions
for select to authenticated
using (private.is_organization_member(organization_id));

create policy "Platform admins can read post history"
on public.organization_post_revisions
for select to authenticated
using (private.is_platform_admin());

revoke all on table public.organization_post_revisions from public, anon, authenticated;
grant select on table public.organization_post_revisions to authenticated;

create or replace function private.record_organization_post_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  revision_action text;
begin
  if tg_op = 'INSERT' then
    revision_action := case when new.status = 'published' then 'published' else 'created' end;
  elsif new.moderation_status = 'blocked' and old.moderation_status is distinct from 'blocked' then
    revision_action := 'blocked';
  elsif new.status = 'archived' and old.status is distinct from 'archived' then
    revision_action := 'archived';
  elsif old.status = 'archived' and new.status = 'published' then
    revision_action := 'restored';
  elsif new.status = 'published' and old.status is distinct from 'published' then
    revision_action := 'published';
  elsif new.moderation_status is distinct from old.moderation_status then
    revision_action := 'moderation_updated';
  else
    revision_action := 'updated';
  end if;

  insert into public.organization_post_revisions (
    post_id, organization_id, actor_id, action, snapshot
  ) values (
    new.id,
    new.organization_id,
    coalesce((select auth.uid()), new.author_id),
    revision_action,
    jsonb_build_object(
      'title', new.title,
      'excerpt', new.excerpt,
      'body', new.body,
      'cover_image_path', new.cover_image_path,
      'status', new.status,
      'moderation_status', new.moderation_status,
      'published_at', new.published_at,
      'archived_at', new.archived_at
    )
  );

  return new;
end;
$$;

revoke all on function private.record_organization_post_revision() from public, anon, authenticated;

create trigger organization_posts_record_revision
after insert or update on public.organization_posts
for each row execute function private.record_organization_post_revision();

-- All author publishing goes through a narrowly scoped RPC. Direct table writes are removed.
drop policy "Hiring teams can create posts" on public.organization_posts;
drop policy "Hiring teams can update posts" on public.organization_posts;
drop policy "Organization managers can delete posts" on public.organization_posts;

revoke insert, update, delete on table public.organization_posts from authenticated;

create or replace function public.save_organization_post(
  target_post_id uuid,
  target_organization_id uuid,
  target_title text,
  target_excerpt text,
  target_body text,
  target_cover_image_path text,
  remove_cover_image boolean,
  target_intent text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  existing_post public.organization_posts%rowtype;
  target_status text;
  next_cover_image_path text;
  can_manage_all boolean;
  saved_post_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;
  if target_intent not in ('draft', 'publish') then
    raise exception 'Unsupported article action.';
  end if;
  if char_length(trim(target_title)) not between 5 and 180
    or char_length(trim(target_excerpt)) not between 20 and 360
    or char_length(trim(target_body)) not between 100 and 30000 then
    raise exception 'Review the title, summary, and article length.';
  end if;
  if target_cover_image_path is not null
    and (target_cover_image_path !~ ('^' || target_organization_id::text || '/')) then
    raise exception 'The cover image does not belong to this organization.';
  end if;

  can_manage_all := private.is_organization_member(
    target_organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  );

  if not can_manage_all and not private.is_organization_member(
    target_organization_id,
    array['recruiter']::public.organization_member_role[]
  ) then
    raise exception 'You do not have permission to manage organization posts.';
  end if;

  target_status := case when target_intent = 'publish' then 'published' else 'draft' end;

  if target_post_id is null then
    insert into public.organization_posts (
      organization_id, author_id, slug, title, excerpt, body, cover_image_path,
      status, moderation_status, published_at
    ) values (
      target_organization_id,
      current_user_id,
      coalesce(
        nullif(trim(both '-' from lower(regexp_replace(trim(target_title), '[^a-zA-Z0-9]+', '-', 'g'))), ''),
        'update'
      ) || '-' || left(replace(gen_random_uuid()::text, '-', ''), 8),
      trim(target_title), trim(target_excerpt), trim(target_body), target_cover_image_path,
      target_status,
      case when target_status = 'published' then 'approved' else 'pending' end,
      case when target_status = 'published' then now() else null end
    ) returning id into saved_post_id;
    return saved_post_id;
  end if;

  select * into existing_post
  from public.organization_posts
  where id = target_post_id and organization_id = target_organization_id
  for update;

  if not found then
    raise exception 'Article not found.';
  end if;
  if existing_post.author_id <> current_user_id and not can_manage_all then
    raise exception 'You can only manage articles you authored.';
  end if;
  if existing_post.moderation_status = 'blocked' then
    raise exception 'A blocked article can only be restored by a platform administrator.';
  end if;

  next_cover_image_path := case
    when remove_cover_image then null
    else coalesce(target_cover_image_path, existing_post.cover_image_path)
  end;

  update public.organization_posts
  set
    title = trim(target_title),
    excerpt = trim(target_excerpt),
    body = trim(target_body),
    cover_image_path = next_cover_image_path,
    status = target_status,
    moderation_status = case when target_status = 'published' then 'approved' else 'pending' end,
    moderation_reason = null,
    moderated_at = case when target_status = 'published' then now() else null end,
    moderated_by = null,
    published_at = case
      when target_status = 'published' then coalesce(existing_post.published_at, now())
      else null
    end,
    archived_at = null,
    archived_by = null
  where id = existing_post.id
  returning id into saved_post_id;

  return saved_post_id;
end;
$$;

revoke all on function public.save_organization_post(uuid, uuid, text, text, text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.save_organization_post(uuid, uuid, text, text, text, text, boolean, text) to authenticated;

create or replace function public.archive_organization_post(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  existing_post public.organization_posts%rowtype;
  can_manage_all boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  select * into existing_post from public.organization_posts where id = target_post_id for update;
  if not found then
    raise exception 'Article not found.';
  end if;

  can_manage_all := private.is_organization_member(
    existing_post.organization_id,
    array['owner', 'admin']::public.organization_member_role[]
  );
  if existing_post.author_id <> current_user_id and not can_manage_all then
    raise exception 'You can only remove articles you authored.';
  end if;
  if existing_post.moderation_status = 'blocked' then
    raise exception 'A blocked article can only be restored by a platform administrator.';
  end if;

  update public.organization_posts
  set status = 'archived', archived_at = now(), archived_by = current_user_id
  where id = existing_post.id;
end;
$$;

revoke all on function public.archive_organization_post(uuid) from public, anon, authenticated;
grant execute on function public.archive_organization_post(uuid) to authenticated;

-- Existing submissions were waiting in the former manual queue. They now publish automatically.
update public.organization_posts
set status = 'published', moderation_status = 'approved', published_at = coalesce(published_at, now()),
    moderation_reason = null, moderated_at = now(), moderated_by = null
where status = 'submitted' and moderation_status = 'pending';
