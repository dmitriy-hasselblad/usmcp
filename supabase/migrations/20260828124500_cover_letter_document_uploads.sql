-- First commit the new enum label. PostgreSQL does not allow a new enum label
-- to be used by constraints until the transaction that introduced it has ended.

alter type public.professional_document_type add value if not exists 'cover_letter';
