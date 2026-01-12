---
description: Run after completing work to verify tests pass and commit changes
---

# Agent Done Its Work Workflow

## Test Framework

**This project uses Vitest** as the test runner.
- Run all tests: `npx vitest run`
- Run a single test file: `npx vitest run <path/to/file.test.js>`
- Watch mode: `npx vitest`

---

## Step 1 — Run All Unit Tests

// turbo
```bash
npx vitest run
```

Check the output:
- ✅ **All tests pass** → Proceed to Step 2
- ❌ **Any test fails** → Proceed to Step 3

---

## Step 2 — Commit (All Tests Passed)

Follow the `/commit` workflow:

2.1 Stage all changes:
// turbo
```bash
git add -A
```

2.2 Commit with behavior ID:
```bash
git commit -m "B-<id>: <behavior summary>"
```

2.3 Update `agent/BEHAVIOR_BACKLOG.md` to mark behavior as ✅.

**Done!** Work is complete.

---

## Step 3 — Fix Failing Tests

If any tests failed:

3.1 Identify the failing test(s) from the output.

3.2 Switch to the `/fix-bugs` workflow:
- Convert each failure into a missing behavior (Given/When/Then)
- Add to `agent/BEHAVIOR_BACKLOG.md` as TODO under Bugfix
- Create targeted test, implement minimal fix

3.3 After fixing, **restart this workflow from Step 1**.

---

## Flowchart

```
┌─────────────────────┐
│   Work Completed    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Run All Tests      │
│  npx vitest run     │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
   PASS        FAIL
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────┐
│ Commit  │  │ /fix-bugs   │
│ Changes │  │ workflow    │
└────┬────┘  └──────┬──────┘
     │              │
     ▼              │
   DONE ◄───────────┘
          (restart from Step 1)
```

---

## Rules

1. **Never commit with failing tests** - Always run tests first
2. **Fix before commit** - Enter fix-bugs workflow if any test fails
3. **Loop until green** - Restart this workflow after each fix attempt
4. **One behavior per commit** - Don't batch multiple behaviors

