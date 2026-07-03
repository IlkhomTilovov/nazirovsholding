-- Batch 2 (catalog cluster) — Migration A: additive jsonb translation columns.
-- Old *_uz/*_ru columns are left untouched; dropped in a follow-up migration
-- only after the new columns are verified working in the app.

-- categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_title jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_description jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.categories SET
  name = jsonb_build_object('uz', COALESCE(name_uz, ''), 'ru', COALESCE(name_ru, '')),
  meta_title = jsonb_build_object('uz', COALESCE(meta_title_uz, ''), 'ru', COALESCE(meta_title_ru, '')),
  meta_description = jsonb_build_object('uz', COALESCE(meta_description_uz, ''), 'ru', COALESCE(meta_description_ru, ''));

-- products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS full_description jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS keyword jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_title jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_description jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.products SET
  name = jsonb_build_object('uz', COALESCE(name_uz, ''), 'ru', COALESCE(name_ru, '')),
  description = jsonb_build_object('uz', COALESCE(description_uz, ''), 'ru', COALESCE(description_ru, '')),
  full_description = jsonb_build_object('uz', COALESCE(full_description_uz, ''), 'ru', COALESCE(full_description_ru, '')),
  keyword = jsonb_build_object('uz', COALESCE(keyword_uz, ''), 'ru', COALESCE(keyword_ru, '')),
  meta_title = jsonb_build_object('uz', COALESCE(meta_title_uz, ''), 'ru', COALESCE(meta_title_ru, '')),
  meta_description = jsonb_build_object('uz', COALESCE(meta_description_uz, ''), 'ru', COALESCE(meta_description_ru, '')),
  variants = jsonb_build_object('uz', COALESCE(to_jsonb(variants_uz), '[]'::jsonb), 'ru', COALESCE(to_jsonb(variants_ru), '[]'::jsonb));

-- attribute_groups
ALTER TABLE public.attribute_groups
  ADD COLUMN IF NOT EXISTS name jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.attribute_groups SET
  name = jsonb_build_object('uz', COALESCE(name_uz, ''), 'ru', COALESCE(name_ru, '')),
  description = jsonb_build_object('uz', COALESCE(description_uz, ''), 'ru', COALESCE(description_ru, ''));

-- attributes
ALTER TABLE public.attributes
  ADD COLUMN IF NOT EXISTS name jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS placeholder jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.attributes SET
  name = jsonb_build_object('uz', COALESCE(name_uz, ''), 'ru', COALESCE(name_ru, '')),
  placeholder = jsonb_build_object('uz', COALESCE(placeholder_uz, ''), 'ru', COALESCE(placeholder_ru, ''));

-- attribute_options
ALTER TABLE public.attribute_options
  ADD COLUMN IF NOT EXISTS label jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.attribute_options SET
  label = jsonb_build_object('uz', COALESCE(label_uz, ''), 'ru', COALESCE(label_ru, ''));
