# Agent Instructions for car-ga

This document provides guidance for AI coding agents working on this project.

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
| `agent/BEHAVIOR_BACKLOG.md` | Single source of truth for behaviors, status, and per-behavior test mapping |
| `agent/LESSONS.md` | Append-only "Verified Project Lessons." Written only when verified by evidence |
| `agent/TEST_RUNTIME.md` | Tracks slow tests (>2ms) and remediation notes |

---

### Test Framework

- **Framework**: Vitest
- **Run all tests command**: `npx vitest run`
- Record this command at the top of `BEHAVIOR_BACKLOG.md`

---

### Slow Test Policy

- Any unit test whose runtime is > 2ms is a "slow test"
- Measurement source: test runner report
- If runner report does not provide per-test timing: agent must introduce timing instrumentation
- Slow tests must be logged in `agent/TEST_RUNTIME.md`
- Fixing slow tests can be deferred until the end of the work item, but must be performed before declaring complete

---

### Commit Policy

- Agent MUST commit after each behavior is completed and all unit tests pass
- Commit message format: `B-<id>: <behavior summary>`
- Each commit must include:
  - Code changes
  - The new test (unit or snapshot)
  - Updated backlog status row
  - Any lesson entry (if applicable)
  - Test runtime entry (if applicable)
- When agent has finished their work and all unit tests pass, they MUST commit

---

## Project Overview

**car-ga** is a genetic algorithm car evolution simulation game built with:
- **Vite** - Build tool and dev server
- **Planck.js** - 2D physics engine (Box2D port)
- **Vitest** - Testing framework
- **Vanilla JS** - No framework, ES modules

## Directory Structure

```
car-ga/
├── src/              # Source code
│   ├── ga/           # Genetic algorithm (DNA, mutation, crossover, selection)
│   ├── physics/      # Physics simulation (buildCar, simulate, track)
│   ├── ui/           # UI components (app, store, minimap)
│   └── *.js          # Core modules (gameConfig, etc.)
├── public/           # Static assets (images, fonts)
├── agent/            # TDD artifacts (BEHAVIOR_BACKLOG.md)
├── .agent/workflows/ # Workflow definitions
├── qa/               # QA testing artifacts
├── index.html        # Entry point
└── style.css         # Global styles
```

## Development Commands

```bash
# Start dev server
npm run dev

# Run all unit tests
npx vitest run

# Run tests in watch mode
npx vitest

# Build for production
npm run build
```

## Testing Guidelines

- Tests use **Vitest** framework
- Test files are co-located with source: `*.test.js`
- Follow TDD practices as defined in `.agent/workflows/`
- Each test should have exactly one assertion

## Code Style

- ES Modules (`import`/`export`)
- Descriptive function and variable names
- Keep functions small and focused
- Document complex physics or GA logic with comments

## Important Files

- `src/gameConfig.js` - Game configuration constants
- `src/ga/dna.js` - Car DNA encoding/decoding
- `src/physics/buildCar.js` - Creates physics bodies from DNA
- `src/ui/app.js` - Main UI controller

## Workflows

Check `.agent/workflows/` for defined procedures:
- `/new-feature` - Adding new functionality
- `/fix-bugs` - Bug fixing process
- `/quality-assurance` - QA testing
- `/commit` - Commit process
