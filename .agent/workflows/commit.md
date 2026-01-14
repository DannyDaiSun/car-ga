---
description: How to commit code changes after completing work
---

# Commit Workflow

## Test Framework

**This project uses Vitest** as the test runner.
- Run all tests: `npx vitest run`
- Run a single test file: `npx vitest run <path/to/file.test.js>`
- Watch mode: `npx vitest`

## When to Commit

Commit after **each behavior** is completed. A behavior is complete when:
1. The test file has been created/updated
2. All unit tests pass (`npx vitest run`)
3. The behavior file in `agent/behaviors/` has been updated to DONE
4. Test runtime has been recorded (if > 2ms)

## Commit Process

// turbo-all

### Step 1: Run All Tests
```bash
npx vitest run
```
All tests MUST pass. If any test fails, fix it before proceeding.

### Step 2: Stage Changes
```bash
git add -A
```

### Step 3: Commit with Behavior ID
```bash
git commit -m "B-<id>: <behavior summary>"
```

Example:
```bash
git commit -m "B-7: pickParentRoulette returns cloned DNA with zero fitness"
```

### Step 4: Update Behavior Status
Mark the behavior as DONE in its `agent/behaviors/B-<id>.md` file.

### Step 5: Record Slow Test Runtime (if applicable)
If the test runtime is > 2ms:
- Create a new file in `agent/test-runtime/<test-name>.md`
- Use the template:
  ```markdown
  Test: <test name or file path>
  Runtime: <ms>
  Cause hypothesis: <short note>
  Mitigation tried: <short note>
  Before/After: <metrics or notes>
  ```
- Include this file in the commit

## Commit Message Format

```
B-<id>: <one-line behavior description>
```

- `B-<id>` matches the unique ID in `agent/behaviors/B-<id>.md`
- Description should be the behavior summary (Given/When/Then simplified)
- Maximum 72 characters for the subject line

## What to Include in Each Commit

Each commit must include:
- Code changes
- The new test (unit or snapshot)
- Updated behavior file in `agent/behaviors/`
- Test runtime entry in `agent/test-runtime/` (if test > 2ms)
- Any lesson entry in `agent/LESSONS.md` (if applicable)

## Slow Test Policy

- Any unit test whose runtime is > 2ms is a "slow test"
- Measurement source: test runner report
- Slow tests must be logged as individual files in `agent/test-runtime/` (one file per test) to avoid merge conflicts
- `agent/TEST_RUNTIME.md` is legacy-only; do not append new rows
- Fixing slow tests can be deferred until the end of the work item, but must be performed before declaring complete

## Rules

1. **Never batch behaviors** - One commit per behavior, not per file or module
2. **Tests must pass** - Never commit with failing tests
3. **Include all related files** - Test file + source changes + backlog update + test runtime (if > 2ms)
4. **Commit immediately** - After tests pass, commit before starting next behavior
5. **Unique behavior IDs** - Use timestamped IDs (e.g., `B-20250110-153045-reset-camera`) to avoid conflicts

## Anti-Patterns (Do NOT do)

❌ Writing multiple test files then committing once  
❌ Committing without running tests first  
❌ Grouping multiple behaviors in one commit  
❌ Forgetting to update the behavior file in `agent/behaviors/`  
