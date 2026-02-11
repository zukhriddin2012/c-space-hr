# DEB-053 Debuga Handover — Bug Hunting Pass

**Module:** PR2-053 Metronome Sync UX Improvements & Bug Fixes
**Role:** Debuga (Bug Hunter)
**Date:** 2026-02-11
**Status:** `complete`
**Triggered By:** Post DEV-053b (security fix pass) — full implementation review

---

## Methodology

1. Read all previous phase handovers (PRD, DES, ARC, DEV, SEC, DEV-iteration)
2. Ran TypeScript compiler (`npx tsc --noEmit`) — 0 errors baseline
3. Launched parallel deep-review of API route handlers (5 files) and frontend components (5 files)
4. Collected 24 raw findings, triaged into: 3 real bugs, 21 false positives / by-design / accepted

---

## Bugs Found & Fixed (3 fixes, 3 files)

### BUG-1 (HIGH): Monthly Recurrence Month-End Overflow

**File:** `src/lib/utils/recurrence.ts` (line 85-96)
**Change:** +6/-1 lines

The `advanceDate()` function's monthly case used `next.setMonth(next.getMonth() + 1)` which silently overflows for month-end dates. JavaScript's `Date.setMonth()` does not clamp — e.g., Jan 31 + 1 month = "Feb 31" which JavaScript resolves to Mar 2 or Mar 3 (depending on leap year). This causes monthly recurring events starting on the 29th, 30th, or 31st to drift forward and appear on wrong calendar dates.

**Fix:** Added overflow detection after `setMonth()`. If the resulting month doesn't match the intended target month (modulo 12), we call `setDate(0)` which sets the date to the last day of the previous month — effectively clamping to the last valid day of the target month (e.g., Jan 31 → Feb 28).

**Impact:** Affects any monthly recurring key date created on the 29th, 30th, or 31st of a month. Without fix, events would appear on wrong dates in the calendar and accumulate drift over time.

### BUG-2 (MEDIUM): UTC Timezone Bug in handleEndMeeting

**File:** `src/components/metronome/MetronomeDashboard.tsx` (line 266)
**Change:** 1 line

The `handleEndMeeting` handler used `new Date().toISOString().split('T')[0]` to compute `sync_date`, which produces UTC dates. This is the same class of timezone bug that was fixed as F4 in the security iteration (recurrence.ts) and TEST-045 (MonthCalendar.tsx). For users in UTC+ timezones (Uzbekistan, UTC+5), meetings ending between midnight and 5 AM local time would record the previous day's date.

**Fix:** Replaced with local date components: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`.

**Impact:** Low probability (meetings rarely end between midnight and 5 AM), but maintains consistency with the F4 fix pattern and prevents a class of timezone bugs.

### BUG-3 (LOW): Dead `user` Destructure in syncs/[id]

**File:** `src/app/api/metronome/syncs/[id]/route.ts` (line 11)
**Change:** 1 line

After the F3 fix in DEV-053b moved permission checks into `withAuth` middleware, the handler still destructured `{ user, params }` but `user` was no longer referenced. This is dead code.

**Fix:** Changed destructure to `{ params }`.

**Impact:** Code cleanliness only. No runtime impact.

---

## Files Changed (3 files, +7/-3)

| File | Change | Lines |
|------|--------|-------|
| `src/lib/utils/recurrence.ts` | Fix BUG-1: Month-end overflow clamp | +6/-1 |
| `src/components/metronome/MetronomeDashboard.tsx` | Fix BUG-2: UTC → local date in sync_date | +1/-1 |
| `src/app/api/metronome/syncs/[id]/route.ts` | Fix BUG-3: Remove dead `user` destructure | +0/-1 |

---

## Triaged Findings — Not Fixed (21 items)

### FALSE POSITIVES (5)

| Finding | Reason |
|---------|--------|
| Shallow copy in optimistic rollback (Dashboard) | `.map()` creates new arrays; original arrays preserved. Shallow copy of map is sufficient. |
| `now` computed outside useMemo (Dashboard) | Used only as `useState` initial value, runs once on mount. Correct pattern. |
| Onboarding selectors may not exist | Graceful degradation already implemented — fallback centered message shown. |
| MonthCalendar key collisions for recurring events | Keys are unique by construction: `ev.id + '-' + cell.dateStr`. Different events have different IDs. |
| `handleEndMeeting` started_at accuracy | Computing start time by subtracting duration from end time is a design simplification, not a bug. |

### BY DESIGN (7)

| Finding | Reason |
|---------|--------|
| Key-dates DELETE lacks ownership check | Accepted design — Architecta review. Key dates are organizational resources shared by GM+CEO. |
| Toggle only cycles done ↔ pending | By design — `update` action handles intermediate states (in_progress, blocked). Toggle is for quick done/undone. |
| GET action-items returns all items | SEC-H3 pattern — batch fetch + client-side grouping. METRONOME_VIEW permission ensures authorization. |
| PulseBar `_latestSyncId` unused prop | Intentionally reserved (underscore prefix convention). |
| Dashboard `_userRole` unused prop | Intentionally reserved (underscore prefix convention). |
| Dashboard `_canManageDates` unused prop | Intentionally reserved (underscore prefix convention). |
| `handleStatusCycle` uses different logic than toggle API | Intentional — UI provides 3-state cycle (pending → in_progress → done) via `update` action, while toggle API provides binary done/pending flip. |

### ACCEPTED RISK / DEFERRED (9)

| Finding | Severity | Reason |
|---------|----------|--------|
| N+1 queries in reorder | LOW | Bounded at 100 items by Zod. Typical reorder is 5-10 items. Documented trade-off in DEV-053b. |
| GET key-dates unvalidated from/to params | LOW | Supabase handles malformed dates gracefully. SEC-053 F5, not blocking. |
| Unsafe TypeScript cast in GET action-items | LOW | Supabase rejects invalid enum values. SEC-053 MISSED-3, not blocking. |
| DB Partial<Row> permissive typing | INFO | API handlers have field allowlists. Future hardening task. SEC-053 MISSED-2. |
| Onboarding resize without debounce | LOW | Overlay is temporary, resize events are infrequent during use. |
| `handleEndMeeting` creates multiple `new Date()` instances | LOW | Microsecond differences between calls. Not functionally significant. |
| No loading state for individual API calls (toggle, update) | LOW | Optimistic updates provide immediate feedback. Full fetchData() on success handles eventual consistency. |
| Resolved initiatives section uses CSS max-h transition | LOW | Works for most cases. Very long lists may not fully expand within max-h-[2000px]. |
| `endOfThisWeek` calculation assumes Sunday end of week | LOW | US-centric. Uzbekistan uses Monday-start weeks. Cosmetic difference in deadline grouping only. |

---

## Verification

- TypeScript compilation: `npx tsc --noEmit` → 0 errors (before and after fixes)
- All previous 24 atomic tasks + 4 security fixes remain intact (non-breaking changes)
- Month-end overflow fix verified by logic analysis: Jan 31 → setMonth(1) → if month != 1 → setDate(0) → Feb 28/29

---

## What's Left To Do

Nothing — all confirmed bugs are fixed. DEB-053 is complete.

**For Testa (if QA pass follows):**
- Test monthly recurring event created on Jan 31 → verify Feb instance shows on Feb 28 (or Feb 29 in leap year)
- Test monthly recurring event created on Mar 31 → verify Apr instance shows on Apr 30
- Test ending a meeting at 2 AM local time (UTC+5) → verify sync_date shows today's local date
- Verify syncs/[id] PATCH still works correctly after removing `user` from destructure

## Blockers

None.
