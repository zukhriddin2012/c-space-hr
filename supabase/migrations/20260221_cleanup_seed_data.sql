-- Remove seeded demo data from usage_events
-- Seeded events are identified by endpoint = '/seed'
DELETE FROM usage_events WHERE endpoint = '/seed';
