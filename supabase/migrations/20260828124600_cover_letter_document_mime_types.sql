-- Allow uploaded cover letters to be PDFs or DOCX files.

do $$
declare
  existing_constraint text;
begin
  select conname
    into existing_constraint
  from pg_constraint
  where conrelid = 'public.professional_documents'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%document_type <> ''resume''%';

  if existing_constraint is not null then
    execute format(
      'alter table public.professional_documents drop constraint %I',
      existing_constraint
    );
  end if;
end;
$$;

alter table public.professional_documents
add constraint professional_documents_document_type_mime_type_check
check (
  (
    document_type in ('resume', 'cover_letter')
    and mime_type in (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  )
  or (
    document_type not in ('resume', 'cover_letter')
    and mime_type in ('application/pdf', 'image/jpeg', 'image/png')
  )
);
