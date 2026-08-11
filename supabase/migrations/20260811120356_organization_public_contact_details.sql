-- Optional public organization contact details, reused on public News articles.

alter table public.organizations
  add column public_email text check (public_email is null or (char_length(public_email) between 3 and 254 and public_email = lower(public_email))),
  add column public_phone text check (public_phone is null or char_length(public_phone) between 7 and 30),
  add column address_line1 text check (address_line1 is null or char_length(address_line1) between 2 and 160),
  add column address_line2 text check (address_line2 is null or char_length(address_line2) between 2 and 160),
  add column city text check (city is null or char_length(city) between 2 and 120),
  add column postal_code text check (postal_code is null or char_length(postal_code) between 3 and 20);

grant update (public_email, public_phone, address_line1, address_line2, city, postal_code)
on table public.organizations to authenticated;

grant select (public_email, public_phone, address_line1, address_line2, city, postal_code)
on table public.organizations to anon;

drop policy "Anonymous can read approved job organizations" on public.organizations;
create policy "Anonymous can read public organizations"
on public.organizations for select to anon
using (
  exists (select 1 from public.jobs where jobs.organization_id = organizations.id and jobs.status = 'published' and jobs.moderation_status = 'approved')
  or exists (
    select 1 from public.organization_posts
    where organization_posts.organization_id = organizations.id
      and organization_posts.status = 'published'
      and organization_posts.moderation_status = 'approved'
      and organizations.verification_status = 'verified'
  )
);

drop policy "Authenticated users can read available organizations" on public.organizations;
create policy "Authenticated users can read available organizations"
on public.organizations for select to authenticated
using (
  created_by = (select auth.uid())
  or private.is_organization_member(id)
  or exists (select 1 from public.jobs where jobs.organization_id = organizations.id and jobs.status = 'published' and jobs.moderation_status = 'approved')
  or exists (
    select 1 from public.organization_posts
    where organization_posts.organization_id = organizations.id
      and organization_posts.status = 'published'
      and organization_posts.moderation_status = 'approved'
      and organizations.verification_status = 'verified'
  )
);
