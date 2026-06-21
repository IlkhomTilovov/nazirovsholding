
-- Brands table
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo text,
  banner text,
  description_uz text,
  description_ru text,
  website text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  meta_title_uz text,
  meta_title_ru text,
  meta_description_uz text,
  meta_description_ru text,
  meta_keywords text,
  is_indexed boolean NOT NULL DEFAULT true,
  is_followed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brands_slug ON public.brands(slug);
CREATE INDEX idx_brands_active_sort ON public.brands(is_active, sort_order);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view brands"
  ON public.brands FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can manage brands"
  ON public.brands FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add brand_id to products
ALTER TABLE public.products
  ADD COLUMN brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE INDEX idx_products_brand_id ON public.products(brand_id);

-- Storage bucket for brand images
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-images', 'brand-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Brand images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-images');

CREATE POLICY "Admins/editors can upload brand images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-images'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role))
  );

CREATE POLICY "Admins/editors can update brand images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-images'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role))
  );

CREATE POLICY "Admins/editors can delete brand images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-images'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role))
  );
