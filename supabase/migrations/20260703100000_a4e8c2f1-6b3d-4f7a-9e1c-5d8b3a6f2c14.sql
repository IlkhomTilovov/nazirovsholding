-- Official organization links shown in the footer ("Foydali havolalar" section):
-- links to government/regulatory websites with their logos.
CREATE TABLE public.official_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  logo TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.official_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.official_links TO authenticated;
GRANT ALL ON public.official_links TO service_role;

ALTER TABLE public.official_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active official links"
  ON public.official_links FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can manage official links"
  ON public.official_links FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_official_links_updated_at
  BEFORE UPDATE ON public.official_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
