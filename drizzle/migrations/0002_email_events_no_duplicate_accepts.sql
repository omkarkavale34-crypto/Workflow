CREATE UNIQUE INDEX IF NOT EXISTS email_events_one_accepted_per_kind
  ON public.email_events (application_id, kind)
  WHERE status IN ('sent', 'accepted');
CREATE INDEX IF NOT EXISTS email_events_app_kind_idx ON public.email_events (application_id, kind, created_at DESC);