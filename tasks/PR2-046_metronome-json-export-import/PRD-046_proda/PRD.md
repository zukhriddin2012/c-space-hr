# PR2-046: Metronome Sync — JSON Export/Import

> **Product Manager:** Proda | **Date:** 2026-02-10
> **Total Tasks:** 10 | **Estimated Effort:** ~12–16 dev hours
> **Priority:** P2 (Productivity — offline editing with Claude)
> **Depends on:** PR2-045 (Metronome Sync module must be deployed)

---

## 1. Problem Statement

Leadership users maintain their Metronome Sync data (initiatives, decisions, action items, key dates) exclusively through the web UI. This means:

1. **Bulk editing is tedious** — updating 14 initiatives one-by-one through form modals is slow
2. **No offline workflow** — can't work on sync data without the app running
3. **No AI-assisted editing** — can't leverage Claude to analyze, restructure, or draft updates to the data
4. **No portable format** — no way to share the current sync state as a file

## 2. Solution

Add a JSON export/import round-trip to the Metronome Sync dashboard:

1. **Export** → Download a structured `metronome-sync-YYYY-MM-DD.json` file containing all editable entities + last 3 sync records as read-only context
2. **Edit** → Open in any text editor or paste into Claude for AI-assisted review, restructuring, and bulk updates
3. **Import** → Upload the modified JSON back into the system. The app validates it, shows a diff preview of all changes, and applies them on user confirmation

## 3. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-1 | general_manager | export the current metronome data as JSON | I can share it with Claude for analysis and bulk edits |
| US-2 | general_manager | import a modified JSON file | my edits are applied to the system without manual re-entry |
| US-3 | ceo | export the data for offline review | I can review initiative status on a flight without internet |
| US-4 | general_manager | see a diff preview before import applies | I don't accidentally overwrite data |
| US-5 | general_manager | create new items by adding entries with `id: null` | Claude can draft new initiatives/decisions for me |
| US-6 | hr / branch_manager | export data I have access to | I can prepare my function's updates before the sync meeting |

## 4. Feature Specification

### 4.1 Export

**Trigger:** Header dropdown menu (⋮) → "Export JSON"

**Behavior:**
- Fetches all non-archived initiatives (with nested decisions + action items), all key dates, and last 3 sync records
- Generates a JSON file with schema version, metadata, and entity arrays
- Downloads as `metronome-sync-YYYY-MM-DD.json` (browser download)
- No confirmation needed (read-only operation)

**Permissions:** `METRONOME_VIEW` (all 4 leadership roles)

**Exported JSON Template:**

```json
{
  "$schema": "c-space-niya/metronome-sync/v1",
  "exportedAt": "2026-02-10T14:30:00.000Z",
  "exportedBy": {
    "id": "uuid",
    "name": "Zuhriddin",
    "role": "general_manager"
  },
  "_instructions": "Edit initiatives, decisions, actionItems, and keyDates below. Set id to null to create new items. Do not modify _readOnly sections. Re-upload via Import JSON in the dashboard.",

  "initiatives": [
    {
      "id": "existing-uuid",
      "title": "Launch employee onboarding portal",
      "description": "Full onboarding flow with document signing",
      "function_tag": "hr",
      "status_label": "On track for Q1",
      "priority": "high",
      "progress": 65,
      "owner_label": "Dilfuza",
      "deadline": "2026-03-15",
      "deadline_label": "Q1 target",
      "accountable_ids": ["employee-uuid-1"],
      "sort_order": 1,

      "decisions": [
        {
          "id": "existing-uuid",
          "question": "Which onboarding platform vendor?",
          "status": "pending",
          "decided_text": null,
          "deferred_reason": null,
          "deadline": "2026-02-20",
          "function_tag": "hr"
        }
      ],

      "actionItems": [
        {
          "id": "existing-uuid",
          "title": "Draft onboarding checklist",
          "status": "pending",
          "assigned_to": "employee-uuid-2",
          "deadline": "2026-02-15",
          "sort_order": 1
        }
      ]
    }
  ],

  "standaloneDecisions": [
    {
      "id": "existing-uuid",
      "question": "Budget allocation for Q2 training",
      "status": "open",
      "decided_text": null,
      "deferred_reason": null,
      "deadline": "2026-02-28",
      "function_tag": "finance",
      "initiative_id": null
    }
  ],

  "keyDates": [
    {
      "id": "existing-uuid",
      "title": "Q1 board review",
      "date": "2026-03-15",
      "category": "milestone",
      "initiative_id": "linked-uuid-or-null"
    }
  ],

  "_readOnly": {
    "_notice": "This section is for context only. Changes here are ignored on import.",
    "recentSyncs": [
      {
        "sync_date": "2026-02-01",
        "title": "February Sync",
        "duration_minutes": 45,
        "items_discussed": 8,
        "decisions_made": 3,
        "next_sync_date": "2026-03-01",
        "next_sync_focus": "Q1 close-out review",
        "attendee_count": 4
      }
    ],
    "summary": {
      "totalInitiatives": 14,
      "byPriority": { "critical": 4, "high": 7, "strategic": 3 },
      "overdueActionItems": 3,
      "openDecisions": 5
    }
  }
}
```

**Design decisions in template:**
- `id: null` → create new entity on import
- `_readOnly` section → ignored on import but gives Claude historical context for better advice
- `_instructions` field → natural-language guide Claude (or the user) reads first
- `standaloneDecisions` → decisions not linked to any initiative (separate from initiative-nested ones)
- Nested structure → decisions and action items sit inside their parent initiative, matching the mental model
- `$schema` version → enables future format evolution without breaking old exports

### 4.2 Import

**Trigger:** Header dropdown menu (⋮) → "Import JSON"

**Step 1 — File Selection:**
- Opens file picker (accept `.json` only)
- Client-side validation: parse JSON, check `$schema` version, run Zod validation
- If invalid: show error with specific message (e.g., "Initiative at index 3 has invalid priority value 'urgent' — expected one of: critical, high, strategic, resolved")

**Step 2 — Diff Preview (ImportPreviewModal):**
- Compare uploaded data against current DB state (fetched fresh)
- Show categorized changes:

```
┌─────────────────────────────────────────────────┐
│  Import Preview                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✏️  3 initiatives modified                      │
│  ➕  1 new initiative                            │
│  ➕  2 new action items                          │
│  ✏️  1 decision updated (pending → decided)      │
│  ➕  1 new key date                              │
│                                                 │
│  ────────────────────────────────────────────── │
│                                                 │
│  ▸ Initiative: "Launch onboarding portal"       │
│      progress: 65 → 80                          │
│      status_label: "On track" → "At risk"       │
│                                                 │
│  ▸ NEW Initiative: "Q2 hiring plan"             │
│      function: hr | priority: high              │
│                                                 │
│  ▸ Decision: "Platform vendor?"                 │
│      status: pending → decided                  │
│      decided_text: → "Go with Vendor A"         │
│                                                 │
│  ────────────────────────────────────────────── │
│                                                 │
│  [Cancel]              [Apply 8 changes]        │
└─────────────────────────────────────────────────┘
```

**Step 3 — Apply:**
- POST to `/api/metronome/import` with the validated changeset
- Server re-validates everything (never trust client)
- Applies changes in a transaction (all-or-nothing)
- Returns success/failure with count of changes applied
- UI shows success toast and refreshes dashboard data

**Import mode:** Patch-style — items present in DB but missing from the JSON are left untouched (NOT deleted). This is the safest default.

**Permissions:**
- Modifying existing items: `METRONOME_EDIT_OWN` (own function items) or `METRONOME_EDIT_ALL` (any item)
- Creating new items: `METRONOME_CREATE`
- Creating new key dates: `METRONOME_MANAGE_DATES`
- The import API checks permissions per-item and rejects unauthorized changes with specific error messages

### 4.3 UI Placement

Both controls live in a dropdown menu on the MetronomeDashboard header bar:

```
[ Metronome Sync          ⋮ ]
                          ┌──────────────┐
                          │ 📤 Export JSON│
                          │ 📥 Import JSON│
                          └──────────────┘
```

- Export visible to anyone with `METRONOME_VIEW`
- Import visible to anyone with `METRONOME_EDIT_OWN` or higher
- Dropdown uses existing UI dropdown pattern from the codebase

---

## 5. Technical Constraints

### 5.1 Reuse Existing Zod Schemas
The 14 Zod schemas in `src/lib/validators/metronome.ts` should be reused for import validation. New composite schemas are needed:
- `MetronomeExportSchema` — validates the full export structure
- `MetronomeImportSchema` — validates the import payload (strips `_readOnly`, validates entities)

### 5.2 Reuse Existing DB Functions
All CRUD operations should go through existing functions in `src/lib/db/metronome.ts`. The import API route orchestrates calls to:
- `createInitiative()` / `updateInitiative()` for new/modified initiatives
- `createDecision()` / `updateDecision()` for decisions
- `createActionItem()` / `updateActionItem()` for action items
- `createKeyDate()` for new key dates

### 5.3 Transaction Safety
The import endpoint must apply all changes atomically. If any single change fails validation or DB write, the entire import is rolled back. This prevents partial imports that leave data in an inconsistent state.

### 5.4 File Size Limit
Max import file size: 1 MB. A typical export with 20 initiatives, 80 action items, 15 decisions, and 20 key dates is ~30-50 KB. The 1 MB limit provides ample headroom while preventing abuse.

### 5.5 Schema Versioning
The `$schema` field allows future evolution. v1 is the initial format. If the format changes (e.g., new fields, restructured nesting), the import API checks the version and applies the correct parser. Old exports remain importable.

---

## 6. Acceptance Criteria (Feature-Level)

- [ ] Export downloads a valid JSON file with all non-archived entities + last 3 syncs
- [ ] Exported JSON can be re-imported with zero changes (round-trip identity)
- [ ] Import validates JSON structure and shows clear errors for invalid files
- [ ] Import shows diff preview before applying any changes
- [ ] New items (id: null) are created with new UUIDs
- [ ] Modified items are updated field-by-field
- [ ] Missing items are NOT deleted (patch mode)
- [ ] `_readOnly` section is ignored on import
- [ ] Permission checks enforced per-item on import
- [ ] All changes applied atomically (all-or-nothing)
- [ ] Success/error feedback via toast messages
- [ ] TypeScript compiles cleanly (`npx tsc --noEmit`)

---

## 7. Task Dependency Graph

```
T01 (Export Schema + Types)
  │
  ├──→ T02 (Export API) ──→ T03 (Export UI Button + Download)
  │
  └──→ T04 (Import Schema + Validation)
         │
         ├──→ T05 (Diff Engine) ──→ T06 (Import Preview Modal)
         │
         └──→ T07 (Import API) ──→ T08 (Import UI Button + Flow)
                                       │
                                       ▼
                                 T09 (Dropdown Menu Integration)
                                       │
                                       ▼
                                 T10 (i18n + Polish)
```

---

## 8. Atomic Task Breakdown

### T01 — Export/Import Types + Zod Schemas

| | |
|---|---|
| **Scope** | Define TypeScript types and Zod schemas for export/import JSON format |
| **Role** | Deva |
| **Depends on** | Nothing (existing validators as base) |
| **Effort** | ~1.5h |

**Deliverable:** Update `src/lib/validators/metronome.ts` with new schemas

**New schemas:**
- `MetronomeExportV1Schema` — full export structure including `$schema`, metadata, entities, `_readOnly`
- `InitiativeExportSchema` — initiative with nested decisions + action items (extends existing schemas)
- `MetronomeImportPayloadSchema` — import structure (same as export but strips `_readOnly`, allows `id: null`)
- `ImportItemSchema` — union type for items that can be `{ id: string }` (update) or `{ id: null }` (create)

**Acceptance Criteria:**
- [ ] All schemas compose from existing Zod primitives (uuid, functionTag, priority, etc.)
- [ ] Import schema accepts `id: null` for new items
- [ ] Import schema rejects unknown fields (`.strict()`)
- [ ] Export schema validates `_readOnly` section as optional
- [ ] TypeScript types exported alongside schemas

---

### T02 — Export API Endpoint

| | |
|---|---|
| **Scope** | `GET /api/metronome/export` — returns full export JSON |
| **Role** | Deva |
| **Depends on** | T01 |
| **Effort** | ~1.5h |

**Deliverable:** `src/app/api/metronome/export/route.ts`

**Behavior:**
- Fetches all non-archived initiatives with nested decisions + action items
- Fetches standalone decisions (not linked to initiatives)
- Fetches all key dates
- Fetches last 3 sync records for `_readOnly` context
- Fetches summary stats for `_readOnly` context
- Assembles into export template with `$schema: "c-space-niya/metronome-sync/v1"`
- Sets `exportedAt` to current timestamp, `exportedBy` from auth session
- Returns JSON with `Content-Type: application/json`

**Acceptance Criteria:**
- [ ] Wrapped with `withAuth({ permission: PERMISSIONS.METRONOME_VIEW })`
- [ ] Response matches `MetronomeExportV1Schema`
- [ ] Initiatives include nested decisions and action items
- [ ] Standalone decisions in separate array
- [ ] Last 3 syncs in `_readOnly` (ordered by sync_date DESC)
- [ ] `_instructions` field included with natural-language guide
- [ ] Empty arrays for missing data (not null)

---

### T03 — Export UI (Download Button)

| | |
|---|---|
| **Scope** | Client-side export trigger + JSON file download |
| **Role** | Deva |
| **Depends on** | T02, T09 (dropdown menu) |
| **Effort** | ~1h |

**Deliverable:** Export handler in `MetronomeDashboard.tsx` (or extracted utility)

**Behavior:**
1. User clicks "Export JSON" in dropdown
2. Fetch `GET /api/metronome/export`
3. Create `Blob` with JSON (pretty-printed, 2-space indent)
4. Trigger browser download as `metronome-sync-YYYY-MM-DD.json`
5. Show success toast: "Export downloaded"

**Acceptance Criteria:**
- [ ] File downloads with date-stamped filename
- [ ] JSON is pretty-printed (human-readable)
- [ ] Loading state shown during fetch
- [ ] Error toast if fetch fails
- [ ] Works in Chrome, Firefox, Safari

---

### T04 — Import Validation Schema + Diff Types

| | |
|---|---|
| **Scope** | Zod schema for import validation + TypeScript types for diff representation |
| **Role** | Deva |
| **Depends on** | T01 |
| **Effort** | ~1h |

**Deliverable:** Additional types in `src/lib/validators/metronome.ts` + new `src/lib/metronome-diff.ts`

**Diff types:**
```typescript
type ChangeType = 'create' | 'update';
type EntityType = 'initiative' | 'decision' | 'actionItem' | 'keyDate';

interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface EntityChange {
  type: ChangeType;
  entityType: EntityType;
  entityId: string | null;
  title: string; // human-readable label
  fields: FieldChange[]; // empty for 'create'
  nested?: EntityChange[]; // for initiative's decisions/action items
}

interface ImportDiff {
  changes: EntityChange[];
  summary: {
    created: number;
    updated: number;
    byType: Record<EntityType, { created: number; updated: number }>;
  };
}
```

**Acceptance Criteria:**
- [ ] Import schema validates full structure with clear error paths
- [ ] Diff types can represent all change scenarios
- [ ] `FieldChange` captures old/new values for preview display
- [ ] Types exported and usable by both client (preview) and server (API)

---

### T05 — Diff Engine

| | |
|---|---|
| **Scope** | Function that computes diff between import JSON and current DB state |
| **Role** | Deva |
| **Depends on** | T04 |
| **Effort** | ~2h |

**Deliverable:** `src/lib/metronome-diff.ts` — `computeImportDiff(importData, currentData): ImportDiff`

**Logic:**
1. For each initiative in import:
   - If `id` is null → mark as `create`
   - If `id` matches existing → compare fields, mark changed ones as `update`
   - Recurse into nested decisions and action items
2. For standalone decisions: same id-null / id-match logic
3. For key dates: same logic
4. Items in DB but NOT in import → ignored (patch mode, not tracked in diff)
5. Generate summary counts

**Acceptance Criteria:**
- [ ] Correctly identifies new items (id: null)
- [ ] Correctly identifies modified fields on existing items
- [ ] Ignores unchanged items (not in diff)
- [ ] Handles nested entities (initiative → decisions, action items)
- [ ] Produces human-readable `title` for each change
- [ ] Pure function (no side effects, no DB calls)
- [ ] Round-trip test: export → import unchanged → diff shows 0 changes

---

### T06 — Import Preview Modal

| | |
|---|---|
| **Scope** | Modal UI showing diff preview with Apply/Cancel |
| **Role** | Deva |
| **Depends on** | T05 |
| **Effort** | ~2h |

**Deliverable:** `src/components/metronome/ImportPreviewModal.tsx`

**Features:**
- Header: "Import Preview" with change count summary
- Grouped by entity type (Initiatives, Decisions, Action Items, Key Dates)
- Each change expandable:
  - **Create**: green "NEW" badge + entity title + key fields
  - **Update**: entity title + field-level old→new diffs
- Footer: [Cancel] and [Apply N changes] buttons
- Apply button calls import API
- Loading state during apply
- Error handling with specific messages

**Acceptance Criteria:**
- [ ] Summary counts at top (N created, N updated)
- [ ] Field-level diffs shown (old value → new value)
- [ ] New items clearly marked with green "NEW" badge
- [ ] Cancel closes modal without changes
- [ ] Apply triggers import API call
- [ ] Loading spinner during apply
- [ ] Success toast + dashboard refresh on completion
- [ ] Error display if import fails

---

### T07 — Import API Endpoint

| | |
|---|---|
| **Scope** | `POST /api/metronome/import` — validates and applies import changeset |
| **Role** | Deva |
| **Depends on** | T01, T04, T05 |
| **Effort** | ~2.5h |

**Deliverable:** `src/app/api/metronome/import/route.ts`

**Behavior:**
1. Parse request body as JSON
2. Validate against `MetronomeImportPayloadSchema`
3. Fetch current DB state
4. Compute diff using `computeImportDiff()`
5. Check permissions per-change:
   - Creates require `METRONOME_CREATE` (initiatives) or `METRONOME_MANAGE_DATES` (key dates)
   - Updates require `METRONOME_EDIT_OWN` (own items) or `METRONOME_EDIT_ALL` (any item)
6. Apply all changes via existing DB functions
7. Return `{ success: true, applied: { created: N, updated: N } }`

**Error responses:**
- `400` — validation error (with specific field/index paths)
- `403` — permission denied (with which items were rejected)
- `409` — conflict (item was modified since export — compare `updated_at`)
- `500` — DB error (rolled back)

**Acceptance Criteria:**
- [ ] Wrapped with `withAuth({ permission: PERMISSIONS.METRONOME_EDIT_OWN })`
- [ ] Zod validation with clear error messages
- [ ] Per-item permission checks
- [ ] Reuses existing DB CRUD functions
- [ ] Atomic: all-or-nothing (transaction or sequential with rollback)
- [ ] File size limit: reject > 1 MB
- [ ] `_readOnly` section stripped and ignored
- [ ] Returns detailed success/error response

---

### T08 — Import UI (Upload Flow)

| | |
|---|---|
| **Scope** | Client-side file picker + validation + preview trigger |
| **Role** | Deva |
| **Depends on** | T06, T07, T09 (dropdown menu) |
| **Effort** | ~1.5h |

**Deliverable:** Import handler in `MetronomeDashboard.tsx` + hidden file input

**Flow:**
1. User clicks "Import JSON" in dropdown
2. Hidden `<input type="file" accept=".json">` triggered
3. File read via `FileReader` as text
4. Client-side JSON parse + Zod validation
5. If invalid: show error toast with specific message
6. If valid: fetch current data + compute diff on client
7. Open `ImportPreviewModal` with diff
8. On confirm: POST to import API
9. On success: close modal + refresh dashboard + success toast

**Acceptance Criteria:**
- [ ] File picker accepts only `.json` files
- [ ] Client-side validation catches format errors before server call
- [ ] Clear error messages for invalid JSON (parse error) vs invalid structure (Zod error)
- [ ] Preview modal opens with computed diff
- [ ] File size check on client (reject > 1 MB with message)
- [ ] Loading states for each async step

---

### T09 — Dropdown Menu Integration

| | |
|---|---|
| **Scope** | Add ⋮ dropdown menu to MetronomeDashboard header with Export/Import options |
| **Role** | Deva |
| **Depends on** | Nothing (UI shell) |
| **Effort** | ~1h |

**Deliverable:** Update `src/components/metronome/MetronomeDashboard.tsx`

**Features:**
- ⋮ (MoreVertical) icon button in dashboard header area
- Dropdown menu with:
  - "Export JSON" (visible to all with `METRONOME_VIEW`)
  - "Import JSON" (visible to those with `METRONOME_EDIT_OWN` or higher)
- Close on click outside or Escape
- Uses existing UI patterns from codebase

**Acceptance Criteria:**
- [ ] Dropdown positioned correctly (right-aligned, below button)
- [ ] Permission-gated menu items
- [ ] Keyboard accessible (Escape to close)
- [ ] Click outside closes
- [ ] Consistent styling with rest of dashboard

---

### T10 — i18n + Final Polish

| | |
|---|---|
| **Scope** | Add translation keys + loading states + error messages |
| **Role** | Deva |
| **Depends on** | All other tasks |
| **Effort** | ~1h |

**Deliverable:** Update i18n files + final QA pass

**New translation keys (~15-20):**
```
metronome.export.button        // "Export JSON"
metronome.export.success       // "Export downloaded"
metronome.export.error         // "Export failed"
metronome.import.button        // "Import JSON"
metronome.import.preview       // "Import Preview"
metronome.import.apply         // "Apply {count} changes"
metronome.import.success       // "Import complete — {count} changes applied"
metronome.import.error         // "Import failed"
metronome.import.noChanges     // "No changes detected"
metronome.import.invalidFile   // "Invalid file format"
metronome.import.fileTooLarge  // "File too large (max 1 MB)"
metronome.import.created       // "{count} new"
metronome.import.updated       // "{count} modified"
metronome.import.fieldChange   // "{field}: {old} → {new}"
```

**Acceptance Criteria:**
- [ ] All user-facing strings use i18n
- [ ] English, Russian, Uzbek translations added
- [ ] Loading spinners on export/import operations
- [ ] Error messages are specific and actionable
- [ ] `npx tsc --noEmit` passes cleanly

---

## 9. Sprint Plan

### Sprint 1: Foundation + Export (~6h)
| Task | Effort | Parallel? |
|------|--------|-----------|
| T01 Export/Import Schemas | 1.5h | Start |
| T09 Dropdown Menu | 1h | ‖ with T01 |
| T02 Export API | 1.5h | After T01 |
| T03 Export UI | 1h | After T02, T09 |
| T04 Import Validation + Diff Types | 1h | ‖ with T02 |

### Sprint 2: Import (~8h)
| Task | Effort | Parallel? |
|------|--------|-----------|
| T05 Diff Engine | 2h | After T04 |
| T07 Import API | 2.5h | After T05 |
| T06 Import Preview Modal | 2h | ‖ with T07 |
| T08 Import UI Flow | 1.5h | After T06, T07, T09 |

### Sprint 3: Polish (~1h)
| Task | Effort | Parallel? |
|------|--------|-----------|
| T10 i18n + Polish | 1h | After all |

---

## 10. Files Created / Modified

### New Files
| File | Description |
|------|-------------|
| `src/app/api/metronome/export/route.ts` | Export API endpoint |
| `src/app/api/metronome/import/route.ts` | Import API endpoint |
| `src/lib/metronome-diff.ts` | Diff engine + types |
| `src/components/metronome/ImportPreviewModal.tsx` | Diff preview modal |

### Modified Files
| File | Change |
|------|--------|
| `src/lib/validators/metronome.ts` | Add export/import Zod schemas |
| `src/components/metronome/MetronomeDashboard.tsx` | Add dropdown menu + export/import handlers |
| `src/lib/i18n/types.ts` | Add export/import translation keys |
| `src/lib/i18n/en.ts` | English translations |
| `src/lib/i18n/ru.ts` | Russian translations |
| `src/lib/i18n/uz.ts` | Uzbek translations |

---

## 11. Deferred to Post-MVP

1. **CSV export** — for spreadsheet users (different audience than Claude workflow)
2. **Selective export** — export only specific functions or priority levels
3. **Import history log** — track who imported what and when
4. **Conflict resolution UI** — currently import just rejects on `updated_at` mismatch; future: show side-by-side merge
5. **Auto-backup on import** — automatically export before applying import (safety net)
6. **Delete via import** — allow marking items for deletion in JSON (e.g., `"_delete": true`)
7. **Scheduled exports** — automatic daily/weekly JSON email to general_manager
8. **Import from URL** — paste a link instead of uploading a file

---

## 12. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| User imports corrupted JSON | Medium | Low | Client + server Zod validation with clear error messages |
| Import overwrites concurrent edits | Low | Medium | `updated_at` conflict detection on modified items |
| Large exports slow down browser | Low | Low | 1 MB limit; typical export is 30-50 KB |
| Users confused by JSON format | Low | Medium | `_instructions` field in export; documentation |
| Partial import corruption | Low | High | Atomic transaction — all-or-nothing apply |

---

*PRD complete. Ready for Architecta review.*
