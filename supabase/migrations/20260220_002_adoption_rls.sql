-- CSN-190: Security hardening — RLS policies for adoption tables
-- Defense-in-depth: these tables are accessed via supabaseAdmin (service role),
-- but RLS prevents data exposure if anon key is accidentally used client-side.

-- ============================================
-- usage_events — RLS
-- ============================================

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Block all access via anon/authenticated keys (server-side only via service_role)
CREATE POLICY "usage_events_no_anon_access"
  ON usage_events FOR ALL TO anon USING (false);

CREATE POLICY "usage_events_no_authenticated_access"
  ON usage_events FOR ALL TO authenticated USING (false);

-- Service role (supabaseAdmin) bypasses RLS automatically — no policy needed

-- ============================================
-- adoption_snapshots — RLS
-- ============================================

ALTER TABLE adoption_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adoption_snapshots_no_anon_access"
  ON adoption_snapshots FOR ALL TO anon USING (false);

CREATE POLICY "adoption_snapshots_no_authenticated_access"
  ON adoption_snapshots FOR ALL TO authenticated USING (false);

-- ============================================
-- Score range constraints on adoption_snapshots
-- ============================================

ALTER TABLE adoption_snapshots
  ADD CONSTRAINT chk_snapshot_score CHECK (score >= 0 AND score <= 100),
  ADD CONSTRAINT chk_snapshot_breadth CHECK (breadth >= 0 AND breadth <= 100),
  ADD CONSTRAINT chk_snapshot_depth CHECK (depth >= 0 AND depth <= 100),
  ADD CONSTRAINT chk_snapshot_frequency CHECK (frequency >= 0 AND frequency <= 100);
