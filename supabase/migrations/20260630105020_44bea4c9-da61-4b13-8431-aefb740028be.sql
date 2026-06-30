
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Admins and editors can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'editor')));

CREATE POLICY "Admins and editors can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'editor')))
WITH CHECK (bucket_id = 'product-images' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'editor')));

CREATE POLICY "Admins and editors can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'editor')));
