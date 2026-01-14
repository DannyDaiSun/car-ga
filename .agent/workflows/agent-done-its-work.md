---
description: Run after completing work to verify tests pass and commit changes
---

# Agent Done Its Work Workflow

## Test Framework

**This project uses Vitest** as the test runner.
- Run all tests: `npm run test`
- Run a single test file: `npx vitest run <path/to/file.test.js>`
- Watch mode: `npx vitest`

---

## Step 1 — Run All Unit Tests

// turbo
```bash
npm run test
```

Check the output:
- ✅ **All tests pass** → Proceed to Step 2
- ❌ **Any test fails** → Proceed to Step 3

---

## Step 1B — Run E2E Tests for UI Changes (Before PR)

If your work **edits UI layout or makes UI changes**, you must run E2E tests before issuing a PR:

```bash
npm run test:e2e
```

Check the output:
- ✅ **All E2E tests pass** → Proceed to Step 2
- ❌ **Any E2E test fails** → Proceed to Step 3

---

## Step 2 — Slow Test Cleanup (Before Commit)

Before committing, review slow tests:

2.1 Check if any tests in `agent/test-runtime/` are from your current work.

2.2 For each slow test (>2ms), attempt to reduce runtime by:
- Eliminating heavy setup
- Minimizing fixtures
- Replacing external dependencies with fakes/mocks
- Enforcing determinism (seed/time)

2.3 Each optimization should preserve one-assertion-per-test.

2.4 If optimization is not feasible, document justification in the test runtime file.

---

## Step 3 — Commit (All Tests Passed)

Follow the `/commit` workflow:

3.1 Stage all changes:
// turbo
```bash
git add -A
```

3.2 Commit with behavior ID:
```bash
git commit -m "B-<id>: <behavior summary>"
```

3.3 Update the behavior file in `agent/behaviors/` to mark Status as DONE.

**Done!** Work is complete.

---

## Step 4 — Fix Failing Tests

If any tests failed:

4.1 Identify the failing test(s) from the output.

4.2 Switch to the `/fix-bugs` workflow:
- Convert each failure into a missing behavior (Given/When/Then)
- Add as a TODO in a new file under `agent/behaviors/`
- Create targeted test, implement minimal fix

4.3 After fixing, **restart this workflow from Step 1**.

---

## Flowchart

```
┌─────────────────────┐
│   Work Completed    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Run All Tests      │
│  npm run test       │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
   PASS        FAIL
     │           │
     ▼           ▼
┌─────────────┐  ┌─────────────┐
│ Slow Test   │  │ /fix-bugs   │
│ Cleanup     │  │ workflow    │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                │
┌─────────────┐         │
│   Commit    │         │
│   Changes   │         │
└──────┬──────┘         │
       │                │
       ▼                │
     DONE ◄─────────────┘
          (restart from Step 1)
```

---

## Completion Criteria

A work item is complete when:
- All backlog behaviors are DONE
- All unit tests pass
- All E2E tests pass (if UI changes were made)
- Slow tests have been addressed or explicitly justified in `agent/test-runtime/`
- All changes are committed

## Rules

1. **Never commit with failing tests** - Always run tests first
2. **Fix before commit** - Enter fix-bugs workflow if any test fails
3. **Loop until green** - Restart this workflow after each fix attempt
4. **One behavior per commit** - Don't batch multiple behaviors
5. **Clean up slow tests** - Address tests > 2ms before declaring complete
