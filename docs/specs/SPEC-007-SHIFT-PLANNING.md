# SPEC-007: Shift Planning Module

> **Status:** Ready for Development ✅
> **Author:** Proda (AI Product Manager)
> **Created:** February 1, 2026
> **Priority:** High
> **Estimated Effort:** 3-4 weeks (phased)

---

## Key Decisions

| Aspect | Decision |
|--------|----------|
| **Day Shift** | 09:00 → 18:00 (9 hours) |
| **Night Shift** | 18:00 → 09:00 (15 hours, overnight) |
| **Staff per shift** | Day: 1-2 (by branch), Night: 1 |
| **Branch Manager role** | Can edit own branch, cannot publish |
| **Publish control** | Ops Assistant only |
| **Time off (1-2 days)** | Auto-approved ✅ |
| **Time off (3+ days)** | Needs HR approval 🔐 |
| **Cleaning staff** | Out of scope (Phase 1) |

---

## 1. Executive Summary

### Problem Statement
C-Space operates 15 coworking branches in Tashkent with ~200 employees working day and night shifts. Currently, shift planning happens 1-2 days in advance via Telegram, calls, and verbal communication. This leads to:
- Last-minute schedule chaos
- Uncovered shifts
- No single source of truth
- Employees unsure of their schedules
- Operations Assistant overwhelmed coordinating 15 branches

### Solution
A digital shift planning module that enables:
- **10-day advance planning** (up from 1-2 days)
- **Visual weekly grid** for all branches
- **Role-based access** (Ops Assistant = all, Branch Manager = own branch)
- **Employee self-service** (view schedule, confirm shifts, request time off)
- **Coverage alerts** (no empty shifts)
- **Telegram notifications** for schedule changes

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Planning horizon | 1-2 days | 10 days |
| Last-minute changes | Many | Reduced 50% |
| Uncovered shifts | Unknown | 0 |
| Employee schedule visibility | Calls/verbal | Self-service |
| Shift confirmations | None | 90%+ |

---

## 2. User Personas

### 2.1 Operations Assistant (Primary Planner)
**Name:** Madina
**Role:** Coordinates all 15 branches
**Goals:**
- See all branches at a glance
- Ensure every shift is covered
- Handle floaters/rotations between branches
- Know who confirmed their shifts

**Pain Points:**
- Juggling 15 branches via Telegram is exhausting
- Last-minute employee cancellations cause panic
- No way to track who's working where across branches

### 2.2 Branch Manager
**Name:** Rustam
**Role:** Manages single branch (e.g., Yunusabad)
**Goals:**
- Know who's working at their branch each day
- Request additional staff when needed
- Handle day-to-day changes within their branch

**Pain Points:**
- Often finds out about schedule changes last-minute
- Can't easily see if coverage is sufficient
- Employees call them directly instead of central system

### 2.3 Community Manager / Staff
**Name:** Aziza
**Role:** Works shifts at one or more branches
**Goals:**
- Know when and where they're working
- Request days off in advance
- Swap shifts with colleagues when needed

**Pain Points:**
- Finds out schedule via calls or "just knows"
- Unclear who to contact for changes
- No visibility into upcoming weeks

---

## 3. Shift Structure

### 3.1 Shift Types
| Shift | Hours | Duration | Staff Required | Notes |
|-------|-------|----------|----------------|-------|
| Day ☀️ | 09:00 - 18:00 | 9 hours | 1-2 per branch | Varies by branch size |
| Night 🌙 | 18:00 - 09:00 | 15 hours | 1 per branch | **Overnight** (spans 2 calendar days) |

**Important:** Night shifts are stored on the **start date**. A Monday night shift (Mon 18:00 → Tue 09:00) is recorded as Monday's assignment.

### 3.2 Employee Roles (for shift planning)
| Role | Can Work | Notes |
|------|----------|-------|
| Community Manager | Day, Night | Primary shift workers |
| Branch Manager | Day | Usually fixed schedule |

> **Note:** Cleaning staff are managed separately and are **out of scope** for Phase 1.

### 3.3 Branch Configuration
Each branch should have configurable:
- Minimum staff for day shift (1 or 2)
- Minimum staff for night shift (usually 1)
- Whether branch has night shift at all

---

## 4. Feature Requirements

### 4.1 Phase 1: Core Planning (MVP)
**Target:** 2 weeks development

#### 4.1.1 Weekly Planning Grid
**User Story:** As Operations Assistant, I want to see all branches and all shifts for a week so I can ensure coverage.

**Acceptance Criteria:**
- [ ] Grid shows: Branches (rows) × Days (columns)
- [ ] Each cell shows Day and Night shift slots
- [ ] Can assign employees to slots via dropdown/search
- [ ] Visual indicator for empty slots (⚠️ red warning)
- [ ] Visual indicator for confirmed vs unconfirmed (✓ vs ?)
- [ ] Can navigate between weeks (past and future)
- [ ] Shows current week + next 2 weeks (10-day horizon)

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📅 Shift Planning                                      Week: Feb 3-9, 2026 │
├─────────────────────────────────────────────────────────────────────────────┤
│  [◀ Prev Week]  [This Week]  [Next Week ▶]                                  │
│                                                                              │
│  Filter: [All Branches ▼]  [All Roles ▼]        Status: 🟡 Draft (12 empty) │
│                                                                              │
│  [Save Draft]  [Publish Week]                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│              │ Mon 3      │ Tue 4      │ Wed 5      │ Thu 6      │ Fri 7    │
├──────────────┼────────────┼────────────┼────────────┼────────────┼──────────┤
│ YUNUSABAD    │            │            │            │            │          │
│  ☀️ Day (2)  │ Aziza ✓    │ Aziza ✓    │ Bobur ?    │ Aziza ✓    │ ⚠️ EMPTY │
│              │ Malika ?   │ Malika ?   │ Malika ?   │ Kamila ✓   │ Malika ? │
│  🌙 Night(1) │ Jasur ✓    │ Jasur ✓    │ Nodira ?   │ Jasur ✓    │ Jasur ✓  │
├──────────────┼────────────┼────────────┼────────────┼────────────┼──────────┤
│ CHILANZAR    │            │            │            │            │          │
│  ☀️ Day (1)  │ Rustam ✓   │ Rustam ✓   │ ⚠️ EMPTY   │ Rustam ✓   │ Dilshod ?│
│  🌙 Night(1) │ Sanjar ✓   │ Sanjar ✓   │ Sanjar ✓   │ ⚠️ EMPTY   │ Sanjar ✓ │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ ... (13 more branches)                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Legend: ✓ Confirmed  ? Pending  ⚠️ Empty/Understaffed
```

#### 4.1.2 Branch Manager View
**User Story:** As Branch Manager, I want to edit my branch's schedule so I can manage my team directly.

**Acceptance Criteria:**
- [ ] Branch Managers see only their assigned branch
- [ ] **Can edit assignments within their branch** (add/remove employees)
- [ ] Cannot publish — Ops Assistant must review and publish
- [ ] Can see employee contact info for coordination
- [ ] Can flag issues / add notes for Ops Assistant
- [ ] Changes show as "pending review" until published

#### 4.1.3 Schedule Status Workflow
**User Story:** As Operations Assistant, I want schedules to have draft/published status so employees only see finalized plans.

**States:**
```
┌──────────┐     ┌────────────┐     ┌───────────┐
│  DRAFT   │────▶│  PUBLISHED │────▶│  LOCKED   │
│          │     │            │     │ (past)    │
└──────────┘     └────────────┘     └───────────┘
     │                  │
     │ (can edit)       │ (can edit with warning)
     ▼                  ▼
  Planning          Changes notify
  in progress       affected employees
```

**Acceptance Criteria:**
- [ ] New weeks start as Draft
- [ ] "Publish" makes schedule visible to employees
- [ ] Changes to published schedule trigger notifications
- [ ] Past weeks auto-lock (view-only)

#### 4.1.4 Employee Assignment
**User Story:** As Operations Assistant, I want to quickly assign employees to shifts with smart filtering.

**Acceptance Criteria:**
- [ ] Click empty slot → dropdown of available employees
- [ ] Filter by: role, branch (for floaters), availability
- [ ] Show warning if employee already assigned elsewhere that day
- [ ] Show warning if employee exceeds weekly hours (optional)
- [ ] Drag-and-drop to move assignments (nice-to-have)

#### 4.1.5 Coverage Validation
**User Story:** As Operations Assistant, I want to see warnings when shifts are understaffed.

**Acceptance Criteria:**
- [ ] Red warning on shifts below minimum staff
- [ ] Summary count: "12 shifts need attention"
- [ ] Cannot publish week with empty required shifts (soft warning)
- [ ] Dashboard widget showing coverage status

---

### 4.2 Phase 2: Employee Experience
**Target:** 1 week development

#### 4.2.1 My Schedule (Employee Portal)
**User Story:** As employee, I want to see my upcoming shifts in My Portal.

**Location:** My Portal → My Schedule (new tab)

**Acceptance Criteria:**
- [ ] Shows next 2 weeks of assigned shifts
- [ ] Each shift shows: date, branch, shift type, hours
- [ ] Visual calendar or list view
- [ ] Clear indication of confirmed vs pending

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│  📅 My Schedule                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  This Week (Feb 3-9)                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Mon, Feb 3   │ Yunusabad  │ ☀️ Day 09:00-18:00  ✓   │   │
│  │ Tue, Feb 4   │ Yunusabad  │ ☀️ Day 09:00-18:00  ✓   │   │
│  │ Wed, Feb 5   │ Chilanzar  │ ☀️ Day 09:00-18:00  ?   │   │
│  │ Thu, Feb 6   │ OFF        │                         │   │
│  │ Fri, Feb 7   │ Yunusabad  │ 🌙 Night 18:00-09:00 ?  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Next Week (Feb 10-16)                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Schedule not yet published                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Request Time Off]                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.2 Shift Confirmation
**User Story:** As employee, I want to confirm I'll attend my shift so managers know I'm reliable.

**Acceptance Criteria:**
- [ ] "Confirm" button on each pending shift
- [ ] Confirmation status visible to planners
- [ ] Telegram notification when schedule published
- [ ] Telegram reminder to confirm (if not confirmed 48h before)

#### 4.2.3 Telegram Notifications
**User Story:** As employee, I want Telegram notifications about my schedule.

**Notification Types:**
| Event | Message |
|-------|---------|
| Week published | "📅 Your schedule for Feb 3-9 is ready. You have 5 shifts." |
| Shift assigned | "➕ New shift: Mon Feb 3, Yunusabad, Day 09:00-18:00" |
| Shift removed | "➖ Shift cancelled: Tue Feb 4" |
| Reminder | "⏰ Please confirm your shift tomorrow: Yunusabad, Day" |

---

### 4.3 Phase 3: Time Off & Availability
**Target:** 1 week development

#### 4.3.1 Time Off Requests
**User Story:** As employee, I want to request days off in advance so planners don't schedule me.

**Smart Auto-Approval Logic:**
```
┌─────────────────────────────────────────────────────┐
│  Employee requests time off                         │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  How many     │
              │  days?        │
              └───────────────┘
                /           \
               /             \
         1-2 days          3+ days
             │                │
             ▼                ▼
      ┌────────────┐   ┌─────────────┐
      │ ✅ Auto-   │   │ 🔐 Pending  │
      │ approved   │   │ HR approval │
      └────────────┘   └─────────────┘
             │                │
             ▼                ▼
      Immediately       Waits for
      blocks scheduling approval first
```

**Acceptance Criteria:**
- [ ] Request form: date range + reason (optional for 1-2 days)
- [ ] **1-2 days:** Auto-approved immediately, blocks scheduling
- [ ] **3+ days:** Requires HR/Ops approval before blocking
- [ ] Shows in planning grid as "unavailable" (after approval)
- [ ] Pending requests show as "⏳ pending" in grid
- [ ] History of past requests
- [ ] Telegram notification when approved/rejected (for 3+ day requests)

#### 4.3.2 Recurring Availability
**User Story:** As employee, I want to set my regular availability (e.g., "I don't work Sundays").

**Acceptance Criteria:**
- [ ] Set weekly pattern (available/unavailable per day)
- [ ] Visual in planning grid (gray out unavailable)
- [ ] Can override for specific weeks

---

### 4.4 Phase 4: Advanced Features (Future)
**Target:** Post-launch improvements

#### 4.4.1 Shift Swaps
- Employee requests swap with colleague
- Colleague approves
- Ops Assistant confirms
- Schedule auto-updates

#### 4.4.2 Open Shifts
- Post unfilled shifts for employees to claim
- First-come-first-served or approval-based
- Telegram broadcast to eligible employees

#### 4.4.3 Copy Previous Week
- Template from last week
- Bulk copy and adjust
- Recurring schedule patterns

#### 4.4.4 Analytics
- Hours per employee per week
- Coverage trends
- No-show rates
- Confirmation rates by employee

---

## 5. Data Model

### 5.1 New Tables

#### `shift_schedules`
Weekly schedule container.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| week_start_date | DATE | Monday of the week |
| status | VARCHAR | draft, published, locked |
| published_at | TIMESTAMP | When published |
| published_by | UUID | FK to employees |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

#### `shift_assignments`
Individual shift assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| schedule_id | UUID | FK to shift_schedules |
| branch_id | VARCHAR | FK to branches |
| date | DATE | Shift date |
| shift_type | VARCHAR | day, night |
| employee_id | UUID | FK to employees |
| role | VARCHAR | community_manager, cleaning, etc. |
| confirmed_at | TIMESTAMP | When employee confirmed |
| notes | TEXT | Shift-specific notes |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

**Indexes:**
- `(schedule_id, branch_id, date, shift_type)` - for grid queries
- `(employee_id, date)` - for "my schedule" queries
- `(date, branch_id)` - for daily views

#### `branch_shift_requirements`
Per-branch staffing requirements.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| branch_id | VARCHAR | FK to branches |
| shift_type | VARCHAR | day, night |
| min_staff | INTEGER | Minimum required (1 or 2) |
| max_staff | INTEGER | Maximum allowed (optional) |
| has_shift | BOOLEAN | Whether branch has this shift |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

#### `time_off_requests`
Employee time off requests.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | FK to employees |
| start_date | DATE | First day off |
| end_date | DATE | Last day off |
| total_days | INTEGER | Calculated: end - start + 1 |
| reason | TEXT | Optional for 1-2 days, recommended for 3+ |
| status | VARCHAR | pending, approved, rejected |
| auto_approved | BOOLEAN | True if 1-2 days (auto), false if 3+ (manual) |
| reviewed_by | UUID | FK to employees (null if auto-approved) |
| reviewed_at | TIMESTAMP | Review timestamp |
| created_at | TIMESTAMP | Record creation |

**Auto-Approval Logic:**
- `total_days <= 2` → `status = 'approved'`, `auto_approved = true`
- `total_days >= 3` → `status = 'pending'`, `auto_approved = false`

#### `employee_availability`
Recurring availability patterns.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | FK to employees |
| day_of_week | INTEGER | 0=Sunday, 1=Monday, etc. |
| available_day | BOOLEAN | Can work day shift |
| available_night | BOOLEAN | Can work night shift |
| effective_from | DATE | When pattern starts |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### 5.2 Employee Table Additions

Add to existing `employees` table:

| Column | Type | Description |
|--------|------|-------------|
| can_work_night | BOOLEAN | Eligible for night shifts |
| is_floater | BOOLEAN | Works at multiple branches |
| primary_branch_id | VARCHAR | Home branch for scheduling |
| max_hours_per_week | INTEGER | Optional limit |

---

## 6. API Design

### 6.1 Schedule Management

```
GET    /api/shifts/schedules
       ?week_start=2026-02-03
       → Returns schedule with all assignments

POST   /api/shifts/schedules
       { week_start_date: "2026-02-03" }
       → Creates new draft schedule

PATCH  /api/shifts/schedules/[id]
       { action: "publish" | "lock" }
       → Changes schedule status

GET    /api/shifts/schedules/[id]/assignments
       → All assignments for a schedule

POST   /api/shifts/assignments
       { schedule_id, branch_id, date, shift_type, employee_id, role }
       → Create assignment

PATCH  /api/shifts/assignments/[id]
       { action: "confirm" | "update", ... }
       → Update assignment

DELETE /api/shifts/assignments/[id]
       → Remove assignment
```

### 6.2 Employee Self-Service

```
GET    /api/my-portal/schedule
       ?from=2026-02-03&to=2026-02-16
       → My upcoming shifts

POST   /api/my-portal/schedule/[assignment_id]/confirm
       → Confirm attendance

GET    /api/my-portal/time-off
       → My time off requests

POST   /api/my-portal/time-off
       { start_date, end_date, reason }
       → Request time off (auto-approves if 1-2 days)
```

### 6.3 Time Off Management (HR/Ops)

```
GET    /api/time-off/pending
       → List pending requests (3+ days needing approval)

PATCH  /api/time-off/[id]
       { action: "approve" | "reject", reason?: string }
       → Approve or reject request
```

### 6.4 Branch Configuration

```
GET    /api/branches/[id]/shift-requirements
       → Get staffing requirements

PUT    /api/branches/[id]/shift-requirements
       { day: { min: 2, max: 3 }, night: { min: 1, has_shift: true } }
       → Update requirements
```

---

## 7. Permissions

| Action | super_admin | hr | branch_manager | employee |
|--------|-------------|-----|----------------|----------|
| View all branches | ✓ | ✓ | ✗ | ✗ |
| View own branch | ✓ | ✓ | ✓ | ✗ |
| Edit all branches | ✓ | ✓ | ✗ | ✗ |
| **Edit own branch** | ✓ | ✓ | **✓** | ✗ |
| Publish schedule | ✓ | ✓ | ✗ | ✗ |
| View own shifts | ✓ | ✓ | ✓ | ✓ |
| Confirm own shifts | ✓ | ✓ | ✓ | ✓ |
| Request time off | ✓ | ✓ | ✓ | ✓ |
| Approve time off (3+ days) | ✓ | ✓ | ✗ | ✗ |
| Configure requirements | ✓ | ✓ | ✗ | ✗ |

**Branch Manager Workflow:**
1. Branch Manager edits their branch's schedule
2. Changes saved as draft
3. Ops Assistant reviews all branches
4. Ops Assistant publishes the week

---

## 8. UI Components

### 8.1 New Components to Build

| Component | Location | Purpose |
|-----------|----------|---------|
| `ShiftPlanningGrid` | `src/components/shifts/` | Main weekly grid |
| `ShiftCell` | `src/components/shifts/` | Single shift slot |
| `EmployeeSelector` | `src/components/shifts/` | Dropdown to assign employee |
| `CoverageIndicator` | `src/components/shifts/` | Warning badge |
| `WeekNavigator` | `src/components/shifts/` | Week selection |
| `MyScheduleView` | `src/components/shifts/` | Employee's schedule |
| `ShiftConfirmButton` | `src/components/shifts/` | Confirm attendance |
| `TimeOffRequestModal` | `src/components/shifts/` | Request time off |
| `BranchRequirementsForm` | `src/components/branch/` | Configure staffing |

### 8.2 Page Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/shifts` | Shift planning grid | hr, super_admin |
| `/shifts/[branch_id]` | Single branch view | branch_manager |
| `/my-portal/schedule` | My schedule | All employees |
| `/settings/shift-requirements` | Branch config | hr, super_admin |

---

## 9. Translations

Add to `src/lib/i18n/types.ts`:

```typescript
shifts: {
  title: string;
  weekOf: string;
  dayShift: string;
  nightShift: string;
  draft: string;
  published: string;
  locked: string;
  publish: string;
  saveDraft: string;
  empty: string;
  understaffed: string;
  confirmed: string;
  pending: string;
  confirmShift: string;
  confirmed: string;
  mySchedule: string;
  noShifts: string;
  requestTimeOff: string;
  timeOffRequested: string;
  shiftsNeedAttention: string;
  copyPreviousWeek: string;
  // ... more as needed
};
```

---

## 10. Implementation Plan

### Week 1: Foundation
- [ ] Database migrations (all new tables)
- [ ] Basic API routes (CRUD for schedules/assignments)
- [ ] ShiftPlanningGrid component (read-only first)
- [ ] WeekNavigator component

### Week 2: Core Functionality
- [ ] Employee assignment (dropdown, search)
- [ ] Coverage validation and warnings
- [ ] Draft/Publish workflow
- [ ] Branch Manager filtered view

### Week 3: Employee Experience
- [ ] My Schedule in My Portal
- [ ] Shift confirmation
- [ ] Telegram notifications
- [ ] Time off requests (basic)

### Week 4: Polish & Testing
- [ ] All translations (EN/RU/UZ)
- [ ] Mobile responsive testing
- [ ] Edge cases (overnight shifts, week boundaries)
- [ ] User acceptance testing

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users resist change from Telegram | High | Training, gradual rollout, keep Telegram notifications |
| Complex overnight shift logic | Medium | Clear timezone handling, thorough testing |
| Performance with 15 branches × 7 days | Medium | Efficient queries, pagination if needed |
| Branch Managers want more control | Low | Start limited, expand based on feedback |

---

## 12. Success Criteria

### Launch Criteria (MVP)
- [ ] Ops Assistant can plan full week for all 15 branches
- [ ] Branch Managers can view their branch schedule
- [ ] Employees can see their shifts in My Portal
- [ ] Empty shifts are clearly visible
- [ ] Schedule can be published and employees notified

### 30-Day Success
- [ ] Planning horizon increased to 7+ days
- [ ] 80%+ shift confirmations
- [ ] Ops Assistant reports time savings
- [ ] Zero missed shifts due to "didn't know"

### 90-Day Success
- [ ] Full 10-day planning horizon achieved
- [ ] 50% reduction in last-minute changes
- [ ] Time off requests flowing through system
- [ ] Positive feedback from Branch Managers

---

## 13. Open Questions

### ✅ Resolved

| Question | Decision |
|----------|----------|
| Night shift hours | **18:00 → 09:00 (overnight, 15 hours)** |
| Branch Manager edit rights | **Can edit their own branch, Ops Assistant publishes** |
| Cleaning staff | **Out of scope for Phase 1** (separate system) |
| Time off approval | **Smart auto-approve:** 1-2 days = auto ✅, 3+ days = needs approval 🔐 |

### 🔶 Still Open

1. **Holidays:** How to handle public holidays in Uzbekistan?
2. **Floater assignments:** Can Ops Assistant assign someone to a branch they don't usually work at?
3. **Overtime tracking:** Should we track when someone exceeds normal hours?

---

## Appendix A: Related Files

| File | Purpose |
|------|---------|
| `TASKS.md` | Add T027: Shift Planning Phase 1 |
| `context.json` | Update modules section |
| `BACKLOG.md` | Reference items #25-38 |

---

*Document Version: 1.0*
*Last Updated: February 1, 2026*
