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

## Commit Message Format

```
B-<id>: <one-line behavior description>
```

- `B-<id>` matches the unique ID in `agent/behaviors/B-<id>.md`
- Description should be the behavior summary (Given/When/Then simplified)
- Maximum 72 characters for the subject line

## Rules

1. **Never batch behaviors** - One commit per behavior, not per file or module
2. **Tests must pass** - Never commit with failing tests
3. **Include all related files** - Test file + source changes + backlog update
4. **Commit immediately** - After tests pass, commit before starting next behavior

## Anti-Patterns (Do NOT do)

❌ Writing multiple test files then committing once  
❌ Committing without running tests first  
❌ Grouping multiple behaviors in one commit  
❌ Forgetting to update the behavior file in `agent/behaviors/`  
