-- Support organization foreign-key lookups as employer data grows.

create index if not exists organizations_created_by_idx
on public.organizations (created_by);

create index if not exists employer_profiles_organization_id_idx
on public.employer_profiles (organization_id);
