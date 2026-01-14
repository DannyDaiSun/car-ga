---
description: Add New Functionality - use this when adding any new behavior to the codebase
---

# New Feature Workflow

## Project Context

**car-ga** is a genetic algorithm car evolution simulation game built with:
- **Vite** - Build tool and dev server
- **Planck.js** - 2D physics engine (Box2D port)
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework
- **Vanilla JS** - No framework, ES modules

### Directory Structure
```
car-ga/
├── src/              # Source code
│   ├── ga/           # Genetic algorithm (DNA, mutation, crossover, selection)
│   ├── physics/      # Physics simulation (buildCar, simulate, track)
│   ├── ui/           # UI components (app, store, minimap)
│   └── *.js          # Core modules (gameConfig, etc.)
├── e2e/              # Playwright E2E tests
├── agent/            # TDD artifacts (behaviors/, LESSONS.md)
└── .agent/workflows/ # Workflow definitions (this file)
```

### Development Commands
```bash
npm run dev        # Start dev server
npm run test       # Run unit tests
npm run test:e2e   # Run E2E tests
npm run test:all   # Run all tests
npm run lint       # Lint code
npm run build      # Build for production
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

Step 0 — Baseline

0.1 Ensure clean working state.
0.2 Run all unit tests (one command).
0.3 If baseline fails, switch to Bugfix workflow unless explicitly authorized to proceed with existing failures.

Step 1 — Decompose into atomic behaviors

1.1 Decompose the feature into behaviors that:
	•	can be validated via a single test with one assertion
	•	are as independent as possible
	•	are phrased as “Given/When/Then outcome”

1.2 Write each behavior into its own file under `agent/behaviors/` as TODO.
	•	Use a globally unique ID (recommended: `B-YYYYMMDD-HHMMSS-<slug>`).
	•	Avoid editing `agent/BEHAVIOR_BACKLOG.md` (legacy-only).

Step 2 — Choose the next behavior (best judgment)

Pick the TODO behavior that is likely:
	•	smallest and most independent
	•	requires the fewest and most localized code changes
	•	avoids touching shared/core modules if a leaf module can satisfy it

Record rationale in the backlog row.

Step 3 — TDD micro-loop (per behavior)

For the selected behavior B-XYZ:

3.1 Write a new targeted test first
	•	Create a new test file or test case dedicated to this behavior.
	•	Exactly one assertion line.
	•	No table-driven tests.
	•	No helper assertions.

3.2 Run only this test; it must fail
	•	The test must fail for the expected reason.

If the test passes unexpectedly
Interpretation: the behavior already exists.
Actions:
	1.	Write a verified lesson in agent/LESSONS.md describing:
	•	what was assumed
	•	what was true
	•	evidence (test name/output; file references if helpful)
	•	what knowledge was missing
	•	guidance for future behavior decomposition
	2.	Mark behavior as DONE in backlog.
	3.	Run all unit tests.
	4.	Commit (because a behavior was completed and artifacts changed).
	5.	Return to Step 2.

3.3 Implement the minimum code to make the test pass
	•	Prefer minimal, localized edits.
	•	Avoid adding extra generalization beyond what is required.

3.4 Refactor for SRP (highest priority)
	•	Refactor only the touched area to improve Single Responsibility.
	•	Avoid broad redesign unless essential.
	•	Keep refactor minimal and test-protected.

3.5 Run all unit tests
	•	If any test fails: fix with minimal changes until green.

3.6 Mark DONE + record runtime
	•	Mark the behavior file Status as DONE.
	•	If this test runtime > 2ms:
	•	record it as a new file in `agent/test-runtime/`.

3.7 Commit
	•	Commit with message B-XYZ: <behavior summary>.

3.8 Repeat

Return to Step 2 until all behaviors are DONE.

Step 4 — Slow test cleanup

After all behaviors are DONE:
	•	Review `agent/test-runtime/`.
	•	For each slow test (>2ms), attempt to reduce runtime by:
	•	eliminating heavy setup
	•	minimizing fixtures
	•	replacing external dependencies with fakes/mocks
	•	enforcing determinism (seed/time)
	•	Each optimization should preserve one-assertion-per-test.
	•	Commit optimizations (either one commit per test or one commit per small batch, best judgment).

Completion

A feature is complete when:
	•	All backlog behaviors are DONE
	•	All unit tests pass
	•	Slow tests have been addressed or explicitly justified in `agent/test-runtime/`
