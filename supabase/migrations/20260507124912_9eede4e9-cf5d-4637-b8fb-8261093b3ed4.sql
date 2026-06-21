ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS brand_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];
CREATE INDEX IF NOT EXISTS idx_categories_brand_ids ON public.categories USING GIN(brand_ids);