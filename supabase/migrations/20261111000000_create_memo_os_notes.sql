CREATE TABLE IF NOT EXISTS public.memo_os_notes (
  id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, id)
);
ALTER TABLE public.memo_os_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memo_os_select_own" ON public.memo_os_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "memo_os_insert_own" ON public.memo_os_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "memo_os_update_own" ON public.memo_os_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "memo_os_delete_own" ON public.memo_os_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memo_os_notes TO authenticated;
