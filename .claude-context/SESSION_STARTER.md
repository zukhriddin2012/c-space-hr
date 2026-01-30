# Session Starter - C-Space HR Web App

> **🆕 For full platform context (web app + bot), see `../SESSION_PROMPT.md`**
> **For quick sessions, see `../QUICK_START_PROMPT.md`**

---

## 🚀 Quick Start Prompt (Copy This)

```
C-Space HR - Development Session

PROJECT: HR management system for C-Space coworking (Tashkent, Uzbekistan)
STACK: Next.js 16 + TypeScript + Tailwind CSS 4 + Supabase + Vercel
PRODUCTION: https://hr.cspace.uz

CONTEXT FILES (read these first):
1. `.claude-context/PROJECT_CONTEXT.md` - Full project details
2. `.claude-context/TASKS.md` - Current sprint and pending tasks
3. `../SESSION_PROMPT.md` - Complete platform overview (includes bot)

KEY CONVENTIONS:
- Components: Import from feature folders (@/components/employee, @/components/ui)
- Database: Import from @/lib/db (modular files)
- Translations: Add to types.ts first, then en.ts, ru.ts, uz.ts
- API routes: Use PATCH for actions, kebab-case naming

TASK: [DESCRIBE YOUR TASK HERE]

Before committing: npx tsc --noEmit && npm run test:run
```

---

## 📋 Task-Specific Prompts

### Translation Work
```
C-Space HR - Translation Task

Context: Read `.claude-context/PROJECT_CONTEXT.md`

Translation files:
- Types: src/lib/i18n/types.ts (add interface first!)
- English: src/lib/i18n/en.ts
- Russian: src/lib/i18n/ru.ts
- Uzbek: src/lib/i18n/uz.ts

Task: [DESCRIBE what needs translation]

⚠️ Always update ALL 4 files. Check PROJECT_CONTEXT.md for existing patterns.
```

### Employee Module
```
C-Space HR - Employee Module Work

Context: Read `.claude-context/PROJECT_CONTEXT.md`

Key files:
- Page: src/app/(dashboard)/employees/page.tsx
- Components: src/components/employee/ (EmployeesTable, AddEmployeeModal, etc.)
- Database: src/lib/db/employees.ts
- API: src/app/api/employees/route.ts

Task: [DESCRIBE]
```

### Attendance Module
```
C-Space HR - Attendance Module Work

Context: Read `.claude-context/PROJECT_CONTEXT.md`

Key files:
- Sheet: src/app/(dashboard)/attendance/sheet/page.tsx
- Dashboard: src/app/(dashboard)/attendance/dashboard/page.tsx
- Components: src/components/attendance/
- Database: src/lib/db/attendance.ts
- API: src/app/api/attendance/*/route.ts

Task: [DESCRIBE]
```

### Recruitment Module
```
C-Space HR - Recruitment Module Work

Context: Read `.claude-context/PROJECT_CONTEXT.md`

Key files:
- Board: src/app/(dashboard)/recruitment/board/page.tsx
- Components: src/components/recruitment/ (CandidatesKanban, CandidateDetailModal)
- Database: src/lib/db/recruitment.ts
- API: src/app/api/candidates/route.ts

Task: [DESCRIBE]
```

### New Component
```
C-Space HR - New Component

Context: Read `.claude-context/PROJECT_CONTEXT.md`

UI Primitives in src/components/ui/:
- Button, Input, Card, Modal, Select, Badge (use these as base)

Pattern to follow:
1. Create component in appropriate feature folder
2. Add to folder's index.ts barrel export
3. Import: import { MyComponent } from '@/components/feature';

Task: [DESCRIBE]
```

### API Endpoint
```
C-Space HR - API Work

Context: Read `.claude-context/PROJECT_CONTEXT.md`

API conventions:
- Location: src/app/api/[feature]/route.ts
- Auth: Use withAuth() wrapper
- Actions: Consolidate into PATCH handler with action field
- Naming: kebab-case (telegram-action, not tg-action)

Example pattern:
export const PATCH = withAuth(async (request, user) => {
  const { action, ...data } = await request.json();
  switch (action) {
    case 'approve': // ...
  }
});

Task: [DESCRIBE]
```

---

## 🔄 Worker Session (Multi-Session Setup)

Use when running parallel sessions. **No git commands** - coordinator handles git.

```
C-Space HR - Worker Session

⚠️ IMPORTANT: This is a WORKER session. Do NOT use git commands.
A coordinator session handles all git operations.

Context: Read `.claude-context/PROJECT_CONTEXT.md`

Your Task: [TASK_ID] - [TASK_TITLE]
[TASK_DESCRIPTION]

Files to modify:
- [FILE_1]
- [FILE_2]

When done:
1. Run `npx tsc --noEmit` to verify no errors
2. List all files you modified/created
3. Summarize changes made
4. DO NOT commit - coordinator will handle it
```

---

## ✅ Session End Checklist

Before ending your session:

- [ ] `npx tsc --noEmit` - No TypeScript errors
- [ ] `npm run test:run` - All tests pass
- [ ] Tested with multiple languages (EN/RU/UZ)
- [ ] Tested with relevant user roles
- [ ] Update `.claude-context/TASKS.md` - Mark task complete
- [ ] Update `.claude-context/PROJECT_CONTEXT.md` - Add to "Recent Changes Log"
- [ ] Commit with descriptive message

---

## 📦 Commands Reference

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run test          # Watch mode
npm run test:run      # Single test run
npm run test:coverage # With coverage
npx tsc --noEmit      # Type check
```

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `../SESSION_PROMPT.md` | Complete platform context (web + bot) |
| `../QUICK_START_PROMPT.md` | Condensed quick-start version |
| `PROJECT_CONTEXT.md` | Detailed project documentation |
| `TASKS.md` | Current sprint and task tracker |
| `context.json` | Structured project metadata |
| `WORKFLOW.md` | Hub-and-spoke multi-session workflow |
