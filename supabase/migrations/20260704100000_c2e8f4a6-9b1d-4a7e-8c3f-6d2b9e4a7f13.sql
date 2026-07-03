-- Batch 1 (brands cluster) — Migration A: additive jsonb translation columns.
-- Old *_uz/*_ru columns are left untouched; dropped in a follow-up migration
-- only after the new columns are verified working in the app.

-- brands
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS name jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_title jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_description jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.brands SET
  name = jsonb_build_object('uz', COALESCE(name_uz, ''), 'ru', COALESCE(name_ru, '')),
  description = jsonb_build_object('uz', COALESCE(description_uz, ''), 'ru', COALESCE(description_ru, '')),
  meta_title = jsonb_build_object('uz', COALESCE(meta_title_uz, ''), 'ru', COALESCE(meta_title_ru, '')),
  meta_description = jsonb_build_object('uz', COALESCE(meta_description_uz, ''), 'ru', COALESCE(meta_description_ru, ''));

-- business_divisions
ALTER TABLE public.business_divisions
  ADD COLUMN IF NOT EXISTS name jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_title jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_description jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS benefits jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.business_divisions SET
  name = jsonb_build_object('uz', COALESCE(name_uz, ''), 'ru', COALESCE(name_ru, '')),
  description = jsonb_build_object('uz', COALESCE(description_uz, ''), 'ru', COALESCE(description_ru, '')),
  meta_title = jsonb_build_object('uz', COALESCE(meta_title_uz, ''), 'ru', COALESCE(meta_title_ru, '')),
  meta_description = jsonb_build_object('uz', COALESCE(meta_description_uz, ''), 'ru', COALESCE(meta_description_ru, '')),
  benefits = jsonb_build_object('uz', COALESCE(benefits_uz, '[]'::jsonb), 'ru', COALESCE(benefits_ru, '[]'::jsonb));

-- brand_case_studies
ALTER TABLE public.brand_case_studies
  ADD COLUMN IF NOT EXISTS country_name jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS category jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS title jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS result jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.brand_case_studies SET
  country_name = jsonb_build_object('uz', COALESCE(country_name_uz, ''), 'ru', COALESCE(country_name_ru, '')),
  category = jsonb_build_object('uz', COALESCE(category_uz, ''), 'ru', COALESCE(category_ru, '')),
  title = jsonb_build_object('uz', COALESCE(title_uz, ''), 'ru', COALESCE(title_ru, '')),
  result = jsonb_build_object('uz', COALESCE(result_uz, ''), 'ru', COALESCE(result_ru, ''));

-- official_links
ALTER TABLE public.official_links
  ADD COLUMN IF NOT EXISTS name jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.official_links SET
  name = jsonb_build_object('uz', COALESCE(name_uz, ''), 'ru', COALESCE(name_ru, ''));
