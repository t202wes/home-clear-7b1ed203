-- Allow anonymous (signed-out) visitors to read demo data for the design preview.
GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.tasks TO anon;
GRANT SELECT ON public.events TO anon;

CREATE POLICY "public read for demo" ON public.properties
  FOR SELECT TO anon USING (true);

CREATE POLICY "public read for demo" ON public.tasks
  FOR SELECT TO anon USING (true);

CREATE POLICY "public read for demo" ON public.events
  FOR SELECT TO anon USING (true);