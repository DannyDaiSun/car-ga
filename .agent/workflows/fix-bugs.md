---
description: use this to fix bugs
---

# Fix Bugs Workflow

## Project Context

**car-ga** is a genetic algorithm car evolution simulation game built with:
- **Vite** - Build tool and dev server
- **Planck.js** - 2D physics engine (Box2D port)
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework
- **Vanilla JS** - No framework, ES modules

### Development Commands
```bash
npm run dev        # Start dev server
npm run test       # Run unit tests
npm run test:e2e   # Run E2E tests
npm run test:all   # Run all tests
npm run lint       # Lint code
```

### CI/CD Pipelines
| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `unit-tests.yml` | Push, PR | Run unit tests |
| `scheduled-qa.yml` | Every 6 hours, Push to main | Run E2E tests, create issues on failure |

## Test Framework

**This project uses Vitest** as the test runner.
- Run all tests: `npx vitest run`
- Run a single test file: `npx vitest run <path/to/file.test.js>`
- Watch mode: `npx vitest`

---

## 🔄 Evidence-Driven Bug Fix Workflow (QA Failures)

When a QA failure occurs (from scheduled Playwright runs or manual testing), follow this exact process:

### Step 1: Reproduce

1. Download artifacts from the failed GitHub Actions run
2. Review the Playwright HTML report
3. Identify the specific failing test(s)
4. Reproduce locally: `npm run test:e2e`
5. Document reproduction steps in the issue/PR

### Step 2: Write Failing Test

1. If no test exists for the bug, create one in `e2e/` or `src/**/*.test.js`
2. The test MUST fail before the fix
3. Commit: `git commit -m "test: add failing test for <bug description>"`

### Step 3: Fix

1. Implement the minimal fix
2. Run `npm run test` to verify unit tests pass
3. Run `npm run test:e2e` to verify E2E tests pass
4. Commit: `git commit -m "fix: <bug description>"`

### Step 4: Verify

1. Run full test suite: `npm run test:all`
2. Run lint: `npm run lint`
3. Create PR with:
   - Reference to the original issue
   - Link to failing run artifacts
   - Before/after screenshots (if visual)
   - Summary of what was fixed

### Step 5: Summarize

In the PR description, include:
```markdown
## Bug Fix Summary

**Issue:** #<issue_number>
**Failed Run:** [Link to GitHub Actions run]

### Root Cause
<Brief explanation of why the bug occurred>

### Fix
<What was changed to fix it>

### Verification
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Lint passes
- [ ] Manual verification (if applicable)
```

---

## Standard Bug Fix Workflow (Unit Test Failures)

---

Step 0 — Baseline failing signal

0.1 Run all unit tests and locate failures.

Step 1 — Identify missing behavior

1.1 Convert the bug into a missing behavior (Given/When/Then).
1.2 Add it as a TODO in a new file under `agent/behaviors/`.
	•	Use a globally unique ID (recommended: `B-YYYYMMDD-HHMMSS-<slug>`).
	•	Avoid editing `agent/BEHAVIOR_BACKLOG.md` (legacy-only).

Step 2 — Implement via the same behavior loop

2.1 Create a new targeted test (not table-driven; one assertion).
2.2 Ensure it fails; if it passes unexpectedly, write a verified lesson and mark DONE as above.
2.3 Implement minimal fix, refactor for SRP, run all tests, mark DONE, commit.

Step 3 — Iterate until resolved

3.1 If the bug persists, repeat:
	•	identify the next missing behavior
	•	add it
	•	test-first loop
until the bug is fixed and tests are green.

⸻

Unit test not feasible rule (when to use snapshot)

Use a snapshot test when:
	•	the bug/feature is primarily rendering/UI output (DOM layout, canvas output proxies, visual state), OR
	•	the agent reasonably concludes a unit test is infeasible due to environment constraints

When using snapshot:
	•	Still one assertion line.
	•	Snapshot scope must be minimized to reduce churn (snapshot the smallest stable representation of output).

⸻

Best Judgment (bounded defaults)

Where “best judgment” is allowed, the agent defaults to:
	•	prefer leaf-module behavior first
	•	avoid touching core shared code unless necessary
	•	prefer additive changes over invasive rewrites
	•	prefer smaller diffs and smaller responsibility scope (SRP)
	•	commit frequently (already required after each behavior)

⸻

Templates (drop-in)

agent/BEHAVIOR_BACKLOG.md template

# Behavior Backlog

Test command (all unit tests): <ONE_COMMAND_HERE>

## Work Item: <Name>
Type: Feature | Bugfix
Created: <date>
Branch: <branch>

| ID | Behavior (Given/When/Then) | Planned Test | Rationale (smallest/independent) | Status | Commit |
|----|----------------------------|--------------|----------------------------------|--------|--------|
| B-001 | Given ... When ... Then ... | test_<...> | ... | TODO | |

agent/LESSONS.md template

# Verified Project Lessons (Append-only)

## Lesson L-001 — <Title>
- Date:
- Trigger: Unexpected passing test for behavior B-XXX
- Assumption:
- Reality:
- Evidence:
- Missing knowledge:
- Guidance for future agents:

agent/test-runtime/<file>.md template

Test: <test name or file path>
Runtime: <ms>
Cause hypothesis: <short note>
Mitigation tried: <short note>
Before/After: <metrics or notes>
