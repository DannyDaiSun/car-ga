---
description: use this to fix bugs
---

Step 0 — Baseline failing signal

0.1 Run all unit tests and locate failures.

Step 1 — Identify missing behavior

1.1 Convert the bug into a missing behavior (Given/When/Then).
1.2 Add it as a TODO in agent/BEHAVIOR_BACKLOG.md under a Bugfix work item.

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

agent/TEST_RUNTIME.md template

# Test Runtime

## Slow tests (>2ms)
| Test | Runtime | Cause hypothesis | Mitigation tried | Before/After |
|------|---------|------------------|------------------|-------------|
