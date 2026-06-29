CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  website TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partners"
  ON public.partners FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can manage partners"
  ON public.partners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();