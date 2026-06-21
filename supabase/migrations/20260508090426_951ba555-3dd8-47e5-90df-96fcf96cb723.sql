
-- Attribute groups
CREATE TABLE public.attribute_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  slug text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_attribute_groups_category ON public.attribute_groups(category_id);

-- Attributes
CREATE TABLE public.attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.attribute_groups(id) ON DELETE CASCADE,
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  slug text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  unit text,
  placeholder_uz text,
  placeholder_ru text,
  is_required boolean NOT NULL DEFAULT false,
  is_filterable boolean NOT NULL DEFAULT false,
  show_in_card boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attributes_field_type_check CHECK (field_type IN ('text','number','select','multiselect','boolean','textarea'))
);
CREATE INDEX idx_attributes_group ON public.attributes(group_id);

-- Attribute options
CREATE TABLE public.attribute_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id uuid NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  label_uz text NOT NULL,
  label_ru text NOT NULL,
  value text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_attribute_options_attribute ON public.attribute_options(attribute_id);

-- Product attribute values
CREATE TABLE public.product_attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, attribute_id)
);
CREATE INDEX idx_pav_product ON public.product_attribute_values(product_id);
CREATE INDEX idx_pav_attribute ON public.product_attribute_values(attribute_id);

-- Triggers updated_at
CREATE TRIGGER trg_ag_updated BEFORE UPDATE ON public.attribute_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_a_updated BEFORE UPDATE ON public.attributes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pav_updated BEFORE UPDATE ON public.product_attribute_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.attribute_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attribute groups" ON public.attribute_groups FOR SELECT USING (true);
CREATE POLICY "Admins manage attribute groups" ON public.attribute_groups FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role));

CREATE POLICY "Anyone can view attributes" ON public.attributes FOR SELECT USING (true);
CREATE POLICY "Admins manage attributes" ON public.attributes FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role));

CREATE POLICY "Anyone can view attribute options" ON public.attribute_options FOR SELECT USING (true);
CREATE POLICY "Admins manage attribute options" ON public.attribute_options FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role));

CREATE POLICY "Anyone can view product attribute values" ON public.product_attribute_values FOR SELECT USING (true);
CREATE POLICY "Admins manage product attribute values" ON public.product_attribute_values FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role));
