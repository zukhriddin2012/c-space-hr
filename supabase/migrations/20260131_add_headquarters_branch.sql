-- ============================================================================
-- ADD HEADQUARTERS BRANCH
-- Run this to add the missing headquarters branch
-- ============================================================================

INSERT INTO branches (id, name, address, latitude, longitude, geofence_radius) VALUES
  ('headquarters', 'C-Space Headquarters', 'Tashkent, HQ Location', 41.3500, 69.2700, 100)
ON CONFLICT (id) DO NOTHING;
