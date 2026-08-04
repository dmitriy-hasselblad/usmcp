create index account_moderation_moderated_by_idx
on public.account_moderation (moderated_by)
where moderated_by is not null;
