# Agent Instructions for car-ga

This document provides guidance for AI coding agents (including Codex, Antigravity, and others) working on this project.

---

## ⚠️ MANDATORY RULES: Test-Driven Development

All agents MUST follow these TDD rules without exception.

### Purpose

This document defines how an AI agent writes code to:
1. Add new functionality safely via behavior-driven TDD.
2. Fix bugs via missing-behavior closure.

It enforces strict unit test structure, commit discipline, and durable project learning capture.

---

### Definitions

**Behavior**
A behavior is the smallest independently verifiable statement of expected system outcome, written in Given/When/Then form, that can be validated by one unit test with one assertion.

**Assertion**
One line of assertion is one assertion, e.g.:
- `expect(...)...`
- `expect.soft(...)...`
- `assert.NoError(err)`
- `assert.Equal(...)`

Each such line counts as exactly one assertion.

**Unit test**
A unit test:
- Contains exactly one assertion line
- Contains assertions only in the test body (no hidden asserts in helpers)
- Is not table-driven (no parameterized test cases to cover many cases at once)
- Exists primarily to cover a single behavior; exhaustive case coverage is not the goal

**Snapshot test (fallback)**
A snapshot test is permitted when:
- The issue is render-related, OR
- The agent reasonably believes a unit test is not feasible

Snapshot tests must still have one assertion line (e.g., `expect(rendered).toMatchSnapshot()`).

**"Smallest code impact"**
When choosing the next behavior, the agent does not measure lines added. Instead, it uses best judgment to pick the behavior likely to require the smallest, most localized change and minimal coupling.

---

### Required Artifacts

All artifacts live under `./agent/`.

| Artifact | Purpose |
|----------|---------|
| `agent/BEHAVIOR_BACKLOG.md` | Legacy index and rules for behavior logging (conflict-minimized updates live in `agent/behaviors/`) |
| `agent/behaviors/` | Single source of truth for behaviors, status, and per-behavior test mapping (one file per behavior) |
| `agent/LESSONS.md` | Append-only "Verified Project Lessons." Written only when verified by evidence |
| `agent/test-runtime/` | Per-test runtime logs for slow tests (>2ms), one file per test to avoid merge conflicts |
| `agent/TEST_RUNTIME.md` | Legacy index for slow tests (do not append new rows) |

---

### Test Framework

- **Framework**: Vitest (unit tests), Playwright (E2E tests)
- **Run unit tests**: `npm run test`
- **Run E2E tests**: `npm run test:e2e`
- **Run all tests**: `npm run test:all`
- Record the test command at the top of `BEHAVIOR_BACKLOG.md`

---

### Slow Test Policy

- Any unit test whose runtime is > 2ms is a "slow test"
- Measurement source: test runner report
- If runner report does not provide per-test timing: agent must introduce timing instrumentation
- Slow tests must be logged as individual files in `agent/test-runtime/` (one file per test) to avoid merge conflicts
- `agent/TEST_RUNTIME.md` is legacy-only; do not append new rows
- Fixing slow tests can be deferred until the end of the work item, but must be performed before declaring complete

---

### Commit Policy

- Agent MUST commit after each behavior is completed and all unit tests pass
- Commit message format: `B-<id>: <behavior summary>`
- Behavior IDs must be globally unique to avoid conflicts; use a timestamped suffix (example: `B-20250110-153045-reset-camera`)
- Each commit must include:
  - Code changes
  - The new test (unit or snapshot)
  - Updated backlog status row
  - Any lesson entry (if applicable)
  - Test runtime entry (if applicable)
- When agent has finished their work and all unit tests pass, they MUST commit

---

## 🔄 Evidence-Driven Bug Fix Workflow

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

## Project Overview

**car-ga** is a genetic algorithm car evolution simulation game built with:
- **Vite** - Build tool and dev server
- **Planck.js** - 2D physics engine (Box2D port)
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework
- **Vanilla JS** - No framework, ES modules

## Directory Structure

```
car-ga/
├── src/              # Source code
│   ├── ga/           # Genetic algorithm (DNA, mutation, crossover, selection)
│   ├── physics/      # Physics simulation (buildCar, simulate, track)
│   ├── ui/           # UI components (app, store, minimap)
│   └── *.js          # Core modules (gameConfig, etc.)
├── e2e/              # Playwright E2E tests
├── public/           # Static assets (images, fonts)
├── agent/            # TDD artifacts (BEHAVIOR_BACKLOG.md)
├── .agent/workflows/ # Workflow definitions
├── .codex/           # Codex setup scripts
├── .github/workflows # GitHub Actions CI/CD
├── qa/               # QA testing artifacts
├── index.html        # Entry point
└── style.css         # Global styles
```

## Development Commands

```bash
# Start dev server
npm run dev

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests
npm run test:all

# Lint code
npm run lint

# Build for production
npm run build
```

## CI/CD Pipelines

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `unit-tests.yml` | Push, PR | Run unit tests |
| `scheduled-qa.yml` | Every 6 hours, Push to main | Run E2E tests, create issues on failure |

## Important Files

- `src/gameConfig.js` - Game configuration constants
- `src/ga/dna.js` - Car DNA encoding/decoding
- `src/physics/buildCar.js` - Creates physics bodies from DNA
- `src/ui/app.js` - Main UI controller
- `playwright.config.js` - Playwright E2E configuration

## Workflows

Check `.agent/workflows/` for defined procedures:
- `/new-feature` - Adding new functionality
- `/fix-bugs` - Bug fixing process
- `/quality-assurance` - QA testing
- `/commit` - Commit process

## Codex Environment

The `.codex/` directory contains:
- `setup.sh` - Runs during container creation (installs deps, Playwright)
- `maintenance.sh` - Runs when checking out branches

Configure in Codex Cloud:
- **Setup Script**: `./.codex/setup.sh`
- **Maintenance Script**: `./.codex/maintenance.sh`
