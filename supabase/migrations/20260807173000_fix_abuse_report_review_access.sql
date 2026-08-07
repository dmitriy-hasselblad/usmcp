-- The public security-invoker wrapper calls this private, security-definer
-- function. Granting execution is safe because the function itself requires an
-- active platform administrator before changing any report.

grant execute on function private.set_abuse_report_status(uuid, text, text)
to authenticated;
