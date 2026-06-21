
-- 1) order_items: replace permissive public insert with role-scoped insert
DROP POLICY IF EXISTS "Public can create order_items" ON public.order_items;
CREATE POLICY "Staff can create order_items"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'manager'::app_role)
     OR public.has_role(auth.uid(), 'seller'::app_role))
    AND quantity >= 1 AND quantity <= 100
    AND length(btrim(product_id)) > 0
    AND length(btrim(product_name_snapshot)) > 0
  );

-- 2) Storage: remove broad authenticated write policies on product-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- 3) Checkout management policies: scope to authenticated role
DROP POLICY IF EXISTS "Admin can manage checkout fields" ON public.checkout_fields;
CREATE POLICY "Admin can manage checkout fields"
  ON public.checkout_fields
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  ));

DROP POLICY IF EXISTS "Admin can manage checkout field options" ON public.checkout_field_options;
CREATE POLICY "Admin can manage checkout field options"
  ON public.checkout_field_options
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])
  ));

-- 4) Analytics events: replace WITH CHECK (true) with validated insert
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.site_analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.site_analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_name IS NOT NULL
    AND length(event_name) BETWEEN 1 AND 64
    AND event_name = ANY (ARRAY[
      'page_view','product_view','order_submit',
      'click_phone','click_telegram','add_to_cart',
      'checkout_start','search','brand_view','category_view'
    ])
    AND session_id IS NOT NULL
    AND length(session_id) BETWEEN 1 AND 128
  );

-- 5) Lock down SECURITY DEFINER trigger/helper functions from direct API execution.
-- has_role is referenced inside RLS policies (executed as definer), so client EXECUTE is not needed.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_single_active_theme() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sitemap_regeneration() FROM PUBLIC, anon, authenticated;
-- get_public_analytics_stats is called from the public /stats page; keep anon access intentionally.
