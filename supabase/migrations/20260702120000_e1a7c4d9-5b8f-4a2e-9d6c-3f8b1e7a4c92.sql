-- Add an editable "benefits" checklist (shown as "Nima olasiz / Что вы получите"
-- on the public brand page when a division is selected).
ALTER TABLE public.business_divisions
  ADD COLUMN IF NOT EXISTS benefits_uz JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS benefits_ru JSONB NOT NULL DEFAULT '[]'::jsonb;
