
-- =============== Helper: updated_at trigger ===============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =============== Enums ===============
CREATE TYPE public.recurrence_kind AS ENUM ('once', 'recurring');
CREATE TYPE public.share_role AS ENUM ('viewer', 'editor');
CREATE TYPE public.sms_direction AS ENUM ('inbound', 'outbound');

-- =============== Properties ===============
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  detail text,
  contact_owner_id uuid, -- FK added after owners table
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_properties_owner ON public.properties(owner_user_id);

-- =============== Property shares ===============
CREATE TABLE public.property_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.share_role NOT NULL DEFAULT 'editor',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_shares TO authenticated;
GRANT ALL ON public.property_shares TO service_role;
ALTER TABLE public.property_shares ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_property_shares_user ON public.property_shares(user_id);
CREATE INDEX idx_property_shares_property ON public.property_shares(property_id);

-- =============== Security definer access helpers ===============
CREATE OR REPLACE FUNCTION public.can_view_property(_property_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = _property_id AND p.owner_user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.property_shares s
    WHERE s.property_id = _property_id AND s.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_property(_property_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = _property_id AND p.owner_user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.property_shares s
    WHERE s.property_id = _property_id AND s.user_id = _user_id AND s.role = 'editor'
  );
$$;

-- =============== Properties policies ===============
CREATE POLICY "view properties you own or were shared with"
  ON public.properties FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() OR public.can_view_property(id, auth.uid()));

CREATE POLICY "insert properties as yourself"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "update properties you can edit"
  ON public.properties FOR UPDATE TO authenticated
  USING (public.can_edit_property(id, auth.uid()))
  WITH CHECK (public.can_edit_property(id, auth.uid()));

CREATE POLICY "delete properties you own"
  ON public.properties FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid());

-- =============== Property shares policies ===============
CREATE POLICY "view shares for properties you own or were shared with"
  ON public.property_shares FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "only property owners manage shares"
  ON public.property_shares FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_user_id = auth.uid()));

-- =============== Tasks ===============
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  recurrence_kind public.recurrence_kind NOT NULL DEFAULT 'once',
  recurrence_every_days int,
  recurrence_label text,
  next_due_at timestamptz NOT NULL,
  notes text,
  last_overdue_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_tasks_property ON public.tasks(property_id);
CREATE INDEX idx_tasks_due ON public.tasks(next_due_at);

CREATE POLICY "view tasks via property access"
  ON public.tasks FOR SELECT TO authenticated
  USING (public.can_view_property(property_id, auth.uid()));
CREATE POLICY "insert tasks for editable properties"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_property(property_id, auth.uid()));
CREATE POLICY "update tasks for editable properties"
  ON public.tasks FOR UPDATE TO authenticated
  USING (public.can_edit_property(property_id, auth.uid()))
  WITH CHECK (public.can_edit_property(property_id, auth.uid()));
CREATE POLICY "delete tasks for editable properties"
  ON public.tasks FOR DELETE TO authenticated
  USING (public.can_edit_property(property_id, auth.uid()));

-- =============== Events (completion log) ===============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  by_name text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_events_task ON public.events(task_id);
CREATE INDEX idx_events_completed ON public.events(completed_at DESC);

CREATE POLICY "view events via task property access"
  ON public.events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_id
      AND public.can_view_property(t.property_id, auth.uid())
  ));
CREATE POLICY "insert events for editable tasks"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_id
      AND public.can_edit_property(t.property_id, auth.uid())
  ));
CREATE POLICY "update events for editable tasks"
  ON public.events FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_id
      AND public.can_edit_property(t.property_id, auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_id
      AND public.can_edit_property(t.property_id, auth.uid())
  ));
CREATE POLICY "delete events for editable tasks"
  ON public.events FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t WHERE t.id = task_id
      AND public.can_edit_property(t.property_id, auth.uid())
  ));

-- =============== Owners (people contacts for SMS) ===============
CREATE TABLE public.owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,  -- E.164
  email text,
  sms_opt_in boolean NOT NULL DEFAULT true,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (created_by, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.owners TO authenticated;
GRANT ALL ON public.owners TO service_role;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER owners_updated_at BEFORE UPDATE ON public.owners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_owners_phone ON public.owners(phone);

CREATE POLICY "manage your own owner contacts"
  ON public.owners FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Now wire up properties.contact_owner_id FK
ALTER TABLE public.properties
  ADD CONSTRAINT properties_contact_owner_fk
  FOREIGN KEY (contact_owner_id) REFERENCES public.owners(id) ON DELETE SET NULL;

-- =============== SMS messages ===============
CREATE TABLE public.sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  direction public.sms_direction NOT NULL,
  body text NOT NULL,
  twilio_sid text,
  status text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_messages TO authenticated;
GRANT ALL ON public.sms_messages TO service_role;
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_sms_messages_owner ON public.sms_messages(owner_id, created_at DESC);

CREATE POLICY "view sms for owners you created"
  ON public.sms_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.owners o WHERE o.id = owner_id AND o.created_by = auth.uid()));

-- =============== SMS preferences ===============
CREATE TABLE public.sms_preferences (
  owner_id uuid PRIMARY KEY REFERENCES public.owners(id) ON DELETE CASCADE,
  daily_digest_enabled boolean NOT NULL DEFAULT false,
  daily_digest_hour int NOT NULL DEFAULT 8,
  weekly_summary_enabled boolean NOT NULL DEFAULT false,
  weekly_summary_dow int NOT NULL DEFAULT 1,  -- Monday
  weekly_summary_hour int NOT NULL DEFAULT 8,
  overdue_alerts_enabled boolean NOT NULL DEFAULT true,
  event_reminder_hours int NOT NULL DEFAULT 24,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_preferences TO authenticated;
GRANT ALL ON public.sms_preferences TO service_role;
ALTER TABLE public.sms_preferences ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER sms_prefs_updated_at BEFORE UPDATE ON public.sms_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "manage prefs for your owners"
  ON public.sms_preferences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.owners o WHERE o.id = owner_id AND o.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.owners o WHERE o.id = owner_id AND o.created_by = auth.uid()));
