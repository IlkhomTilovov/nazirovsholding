ALTER TABLE public.attribute_groups
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS description_uz text,
  ADD COLUMN IF NOT EXISTS description_ru text,
  ADD COLUMN IF NOT EXISTS is_collapsible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seo_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS json_ld_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS filter_visible boolean NOT NULL DEFAULT true;