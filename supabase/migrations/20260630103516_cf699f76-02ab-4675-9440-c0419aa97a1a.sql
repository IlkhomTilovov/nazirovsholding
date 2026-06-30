
-- 1) business_divisions table
CREATE TABLE public.business_divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  slug TEXT NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  icon TEXT,
  cover_image TEXT,
  banner TEXT,
  hero_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta_title_uz TEXT,
  meta_title_ru TEXT,
  meta_description_uz TEXT,
  meta_description_ru TEXT,
  meta_keywords TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, slug)
);

CREATE INDEX idx_business_divisions_brand_id ON public.business_divisions(brand_id);
CREATE INDEX idx_business_divisions_active ON public.business_divisions(is_active);

GRANT SELECT ON public.business_divisions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_divisions TO authenticated;
GRANT ALL ON public.business_divisions TO service_role;

ALTER TABLE public.business_divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active divisions"
  ON public.business_divisions FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors manage divisions"
  ON public.business_divisions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_business_divisions_updated_at
  BEFORE UPDATE ON public.business_divisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) brands new columns
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS light_logo TEXT,
  ADD COLUMN IF NOT EXISTS dark_logo TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS hero_banner TEXT,
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS accent_color TEXT,
  ADD COLUMN IF NOT EXISTS show_in_navigation BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_sort TEXT NOT NULL DEFAULT 'sort_order';

-- 3) categories: link to division (nullable for backwards compat)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES public.business_divisions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_division_id ON public.categories(division_id);
