---
trigger: always_on
---

Purpose

This document defines how an AI agent writes code to:
	1.	Add new functionality safely via behavior-driven TDD.
	2.	Fix bugs via missing-behavior closure.
It enforces strict unit test structure, commit discipline, and durable project learning capture.

⸻

Definitions

Behavior

A behavior is the smallest independently verifiable statement of expected system outcome, written in Given/When/Then form, that can be validated by one unit test with one assertion.

Assertion

One line of assertion is one assertion, e.g.:
	•	expect(...)...
	•	expect.soft(...)...
	•	assert.NoError(err)
	•	assert.Equal(...)
Each such line counts as exactly one assertion.

Unit test

A unit test:
	•	contains exactly one assertion line
	•	contains assertions only in the test body (no hidden asserts in helpers)
	•	is not table-driven (no parameterized test cases to cover many cases at once)
	•	exists primarily to cover a single behavior; exhaustive case coverage is not the goal

Snapshot test (fallback)

A snapshot test is permitted when:
	•	the issue is render-related, OR
	•	the agent reasonably believes a unit test is not feasible (see “Unit test not feasible” rule)
Snapshot tests must still have one assertion line (e.g., expect(rendered).toMatchSnapshot()).

“Smallest code impact”

When choosing the next behavior, the agent does not measure lines added. Instead, it uses best judgment to pick the behavior likely to require the smallest, most localized change and minimal coupling.

⸻

Required Artifacts

All artifacts live under ./agent/.

1) agent/BEHAVIOR_BACKLOG.md

Single source of truth for behaviors, status, and per-behavior test mapping.

2) agent/LESSONS.md

Append-only “Verified Project Lessons.” Written only when verified by evidence (e.g., an unexpected passing test indicates the behavior already exists).

3) agent/TEST_RUNTIME.md

Tracks slow tests (>2ms) and remediation notes.

⸻

Framework Selection Policy
	1.	If the repository already has a test framework, reuse it unless it cannot satisfy:

	•	one command runs all unit tests
	•	failing tests are clearly listed

	2.	If the repo does not have a framework, choose the best fit by ecosystem:

	•	JS/TS: Vitest (preferred) or Jest
	•	Go: go test ./...
	•	Python: pytest
	•	Rust: cargo test
	•	C++: ctest + gtest (if present), otherwise minimal harness

	3.	Record the chosen “run all tests” command at the top of BEHAVIOR_BACKLOG.md.

⸻

Slow Test Policy
	•	Any unit test whose runtime is > 2ms is a “slow test.”
	•	Measurement source: test runner report.
	•	If runner report does not provide per-test timing: agent must introduce a timing tool/instrumentation sufficient to measure per-test runtime, then record it.
	•	Slow tests must be logged in agent/TEST_RUNTIME.md.
	•	Fixing slow tests can be deferred until the end of the work item, but must be performed before declaring the work item complete if any slow tests exist and can reasonably be improved.

⸻

Commit Policy
	•	The agent must commit after each behavior is completed and all unit tests pass.
	•	Commit message format: B-<id>: <behavior summary>
	•	Each commit must include:
	•	code changes
	•	the new test (unit or snapshot)
	•	updated backlog status row
	•	any lesson entry (if applicable)
	•	test runtime entry (if applicable)
