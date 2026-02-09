# HANDOVER — PR2-046: Metronome JSON Export/Import

> **Role:** Proda (Product Manager)
> **Date:** 2026-02-10
> **Status:** Complete — ready for Architecta → Deva pipeline

---

## Session Summary

Discussed and defined the JSON export/import feature for the Metronome Sync module. This enables a round-trip editing workflow: export structured JSON → edit with Claude or text editor → import changes back with diff preview.

---

## Completed

- [x] Discussed feature concept with stakeholder
- [x] Gathered requirements via 4 decision points:
  - Filename format: `metronome-sync-YYYY-MM-DD.json` (contextual)
  - V1 scope: Full round-trip (export + import)
  - UI placement: Header dropdown menu (⋮)
  - Sync history: Last 3 syncs as read-only context
- [x] Designed JSON template structure with `$schema` versioning
- [x] Defined import behavior (patch mode — no deletions)
- [x] Created 10 atomic tasks with dependency graph
- [x] Sprint allocation: ~12-16h across 3 sprints
- [x] Documented acceptance criteria, risks, and deferred items

---

## Files Created

| File | Description |
|------|-------------|
| `tasks/PR2-046_.../PRD-046_proda/PRD.md` | Full PRD with 10 atomic tasks |
| `tasks/PR2-046_.../PRD-046_proda/HANDOVER.md` | This file |

---

## Key Decisions

### D1: Import Mode — Patch, Not Replace
**Decision:** Items in DB but missing from import JSON are left untouched.
**Rationale:** Safest default. Prevents accidental data loss when user exports, edits a few items, and re-imports without the full dataset.

### D2: Schema Versioning
**Decision:** Include `$schema: "c-space-niya/metronome-sync/v1"` in exports.
**Rationale:** Enables future format evolution. Import API checks version and applies correct parser.

### D3: Nested vs Flat Structure
**Decision:** Decisions and action items are nested inside their parent initiative.
**Rationale:** Matches the mental model — when editing an initiative, you see its related items right there. Standalone decisions (not linked to an initiative) get their own top-level array.

### D4: Read-Only Context Section
**Decision:** Include last 3 syncs + summary stats in `_readOnly` section.
**Rationale:** Gives Claude historical context for better advice without making the data editable. Ignored on import.

### D5: Permissions Per-Item on Import
**Decision:** Import API checks permissions for each individual change.
**Rationale:** HR user shouldn't be able to modify finance initiatives by editing JSON, even though they can import.

---

## What's Left to Do

### Next Role: Architecta
1. Validate the JSON template structure against the existing DB schema
2. Confirm diff engine approach (client-side vs server-side)
3. Review transaction strategy for atomic imports
4. Check if `updated_at` comparison is sufficient for conflict detection

### Next Role: Deva
1. Execute T01–T10 per sprint plan in PRD
2. Start with T01 (schemas) + T09 (dropdown UI) in parallel
3. Reuse existing Zod primitives and DB functions

---

## Blockers

None. This feature is additive — no changes to existing data model or APIs.

---

**Handover Status:** `complete`
