-- Analytics events table
CREATE TABLE public.site_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  page_url TEXT,
  page_path TEXT,
  product_id UUID,
  product_slug TEXT,
  product_name TEXT,
  category_id UUID,
  category_name TEXT,
  session_id TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_analytics_event_name ON public.site_analytics_events(event_name);
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics_events(created_at DESC);
CREATE INDEX idx_site_analytics_session_id ON public.site_analytics_events(session_id);
CREATE INDEX idx_site_analytics_product_id ON public.site_analytics_events(product_id);
CREATE INDEX idx_site_analytics_page_path ON public.site_analytics_events(page_path);

ALTER TABLE public.site_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
ON public.site_analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view analytics events"
ON public.site_analytics_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete analytics events"
ON public.site_analytics_events
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Analytics settings columns on system_settings
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS ga4_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ga4_measurement_id TEXT,
  ADD COLUMN IF NOT EXISTS clarity_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clarity_project_id TEXT,
  ADD COLUMN IF NOT EXISTS internal_analytics_enabled BOOLEAN NOT NULL DEFAULT true;