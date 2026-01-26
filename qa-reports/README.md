# QA Reports

This folder contains QA testing reports in JSON format for easy integration with dev boards (Jira, Linear, Trello, etc.).

## Structure

```
qa-reports/
├── README.md                 # This file
├── report-template.json      # Template for new reports
└── YYYY-MM-DD-report.json    # Completed reports
```

## How to Create a New Report

1. Copy `report-template.json` and rename to `YYYY-MM-DD-report.json`
2. Fill in the tester info and environment details
3. Update test statuses as you go
4. Add bugs and improvements as you find them
5. Calculate summary stats when done

## Test Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Not yet tested |
| `passed` | Test passed successfully |
| `failed` | Test failed - bug found |
| `blocked` | Cannot test due to blocker |
| `skipped` | Intentionally skipped |

## Adding a Bug

Add to the `bugs` array:

```json
{
  "id": "BUG-001",
  "title": "Language not saving to database",
  "severity": "high",
  "priority": "P1",
  "status": "open",
  "relatedTest": "LANG-003",
  "stepsToReproduce": [
    "1. Open bot settings",
    "2. Change language to Russian",
    "3. Check database"
  ],
  "expectedResult": "preferred_language column should be 'ru'",
  "actualResult": "Column still shows 'uz'",
  "environment": {
    "device": "iPhone 14",
    "telegramVersion": "10.5.1"
  },
  "screenshots": [],
  "assignee": "",
  "dateFound": "2026-01-26",
  "dateFixed": null
}
```

## Severity Levels

| Level | Description |
|-------|-------------|
| `critical` | App crashes, data loss, security issue |
| `high` | Major feature broken, no workaround |
| `medium` | Feature partially broken, workaround exists |
| `low` | Minor issue, cosmetic, edge case |

## Priority Levels

| Level | Description |
|-------|-------------|
| `P0` | Fix immediately, blocks release |
| `P1` | Fix before release |
| `P2` | Fix in next sprint |
| `P3` | Nice to have, backlog |

## Adding an Improvement Suggestion

Add to the `improvements` array:

```json
{
  "id": "IMP-001",
  "title": "Add confirmation sound on check-in",
  "description": "Play a subtle sound when check-in is successful for better feedback",
  "category": "UX",
  "priority": "P3",
  "effort": "small",
  "status": "proposed"
}
```

## Generating Summary Stats

After completing tests, update the summary:

```json
"summary": {
  "totalTests": 50,
  "passed": 45,
  "failed": 3,
  "blocked": 1,
  "skipped": 1,
  "passRate": "90%"
}
```

## Importing to Dev Boards

### Jira
Use the Jira REST API to create issues from bugs:
```bash
curl -X POST https://your-domain.atlassian.net/rest/api/3/issue \
  -H "Content-Type: application/json" \
  -d @bug-payload.json
```

### Linear
Use Linear's GraphQL API or CSV import.

### Trello
Use Trello API or manual import.

### GitHub Issues
```bash
gh issue create --title "BUG-001: Language not saving" --body "..."
```

## Example: Complete Bug Entry

```json
{
  "id": "BUG-002",
  "title": "Status page shows Uzbek text when language is Russian",
  "severity": "medium",
  "priority": "P1",
  "status": "fixed",
  "relatedTest": "STAT-005",
  "stepsToReproduce": [
    "1. Set language to Russian in bot settings",
    "2. Click Status button",
    "3. View the status message"
  ],
  "expectedResult": "All text should be in Russian",
  "actualResult": "Title is Russian but content shows 'Hozirgi sessiya' in Uzbek",
  "environment": {
    "device": "Android Samsung S23",
    "telegramVersion": "10.5.0"
  },
  "screenshots": ["status-bug-screenshot.png"],
  "assignee": "developer@example.com",
  "dateFound": "2026-01-26",
  "dateFixed": "2026-01-26",
  "fixCommit": "1ef942a"
}
```
