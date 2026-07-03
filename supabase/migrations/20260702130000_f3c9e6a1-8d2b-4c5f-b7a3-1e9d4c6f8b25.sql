-- Brand case studies ("Featured Global Projects") shown on the public brand page.
CREATE TABLE public.brand_case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  image TEXT,
  country_code TEXT NOT NULL,
  country_name_uz TEXT NOT NULL,
  country_name_ru TEXT NOT NULL,
  category_uz TEXT NOT NULL,
  category_ru TEXT NOT NULL,
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  result_uz TEXT,
  result_ru TEXT,
  year TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_case_studies_brand_id ON public.brand_case_studies(brand_id);
CREATE INDEX idx_brand_case_studies_active ON public.brand_case_studies(is_active);

GRANT SELECT ON public.brand_case_studies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_case_studies TO authenticated;
GRANT ALL ON public.brand_case_studies TO service_role;

ALTER TABLE public.brand_case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active case studies"
  ON public.brand_case_studies FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors manage case studies"
  ON public.brand_case_studies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_brand_case_studies_updated_at
  BEFORE UPDATE ON public.brand_case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
