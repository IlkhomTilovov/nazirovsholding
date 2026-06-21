
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(btrim(name)) BETWEEN 1 AND 200
    AND message IS NOT NULL AND length(btrim(message)) BETWEEN 1 AND 5000
    AND (
      (email IS NOT NULL AND length(btrim(email)) BETWEEN 3 AND 320)
      OR (phone IS NOT NULL AND length(btrim(phone)) BETWEEN 3 AND 64)
    )
  );
