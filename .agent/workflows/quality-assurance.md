---
description: Browser QA Tester for Web Game
---

# QA Workflow — Screenshot-First, Expectation-Driven Testing (Web Game)

## Project Context

**car-ga** is a genetic algorithm car evolution simulation game built with:
- **Vite** - Build tool and dev server
- **Planck.js** - 2D physics engine (Box2D port)
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework
- **Vanilla JS** - No framework, ES modules

### Development Commands
```bash
npm run dev          # Start dev server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
npm run test:all     # Run all tests
```

### CI/CD Pipelines
| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `unit-tests.yml` | Push, PR | Run unit tests |
| `scheduled-qa.yml` | Every 6 hours, Push to main | Run E2E tests, create issues on failure |

**Note:** This workflow relates to `scheduled-qa.yml` which automatically runs E2E tests and creates GitHub issues when failures are detected.

## Purpose
Establish a repeatable QA process for a browser-playable game using an AI agent with a built-in browser. The core method is: **assume expected states → capture screenshots at critical points → analyze each screenshot against expectations → file bugs → re-capture screenshots to verify fixes**.

## Repository Outputs
All QA artifacts live under `./qa/` (relative to project root, i.e., `car-ga/qa/`):

- `EXPECTATIONS.md` — expectation catalogue (what should appear at each critical point)
- `SCREENSHOT_INDEX.json` — metadata index of all screenshots (IDs, timestamps, mapping to critical points)
- `BUGS.md` — defect backlog (evidence-driven, reproducible)
- `RUN_LOG.jsonl` — time-ordered execution log (one JSON object per line)
- `VERIFICATION.md` — per-bug verification plans + status updates
- `SCREENSHOTS/` — screenshot files (optional but preferred)

## Workflow Summary
1. **Baseline**: open game, record environment, start console/network observation.
2. **Expectations first**: create an explicit expectation catalogue for critical points.
3. **Screenshot capture**: take screenshots at each critical point, index them.
4. **Screenshot analysis**: compare each screenshot against expectations, create candidate bugs.
5. **Bug consolidation**: dedupe and confirm; create a structured bug backlog.
6. **Fix + verify loop**: for each bug, define minimal verification steps; after fixes, re-capture screenshots and re-compare to expectations.

---

## Phase 0 — Environment Baseline
- Open the game URL.
- Record: timestamp, URL, user agent (if available), viewport size.
- Clear console; note any console errors and network failures from this point forward.
- Log actions to `RUN_LOG.jsonl`.

**Exit criteria**
- Baseline recorded.
- Logging active.

---

## Phase 1 — Expectation Catalogue (`EXPECTATIONS.md`)
Create a list of “Critical Points” (CPs) representing the game’s essential states. Each CP must include:
- Expected visible UI elements (labels, counters, buttons, canvas)
- Expected behavior signals (e.g., generation increments, metrics update, simulation motion)
- Expected absence of failure indicators (blank canvas, NaN, stuck state, fatal console errors)
- Explicit fail signals

**Minimum CPs (adapt to actual UI)**
- CP-01 Landing/Loaded
- CP-02 Ready/Pre-run
- CP-03 Run Started / Gen 1 active
- CP-04 Mid-run (movement/collision)
- CP-05 Stop condition behavior (e.g., 3-second stop)
- CP-06 Generation transition
- CP-07 Restart/reset
- CP-08 Optional controls (pause/speed/params/seed) if present

**Exit criteria**
- Expectations written in testable, observable terms.
- Each CP has pass/fail signals.

---

## Phase 2 — Screenshot Plan & Capture (`SCREENSHOT_INDEX.json`)
For each CP, capture at least one screenshot and index it.

**Index object fields**
- `id` (e.g., SS-001)
- `critical_point` (e.g., CP-03)
- `ts`, `url`, `viewport`
- `description`
- `file`
- `notes`

**Capture rules**
- Capture in CP order.
- If a CP cannot be reached, capture the closest state and note “Not Available”.
- Prefer additional screenshots for optional controls and error states.

**Exit criteria**
- At least one screenshot per CP (or “Not Available” documented).
- Index is complete and consistent.

---

## Phase 3 — Screenshot-by-Screenshot Analysis (Expectation Comparison)
For each screenshot:
1. Compare visible UI/state against the mapped CP expectations.
2. Record pass/fail findings in `RUN_LOG.jsonl`.
3. For each mismatch, create a **Candidate Bug** referencing:
   - Screenshot IDs
   - Failed expectation statement
   - Supporting console/network evidence (if any)

Then consolidate:
- Merge duplicates.
- Promote severity if it blocks progression, crashes, or is consistently reproducible.

**Exit criteria**
- All screenshots analyzed.
- Candidate bugs consolidated into confirmed bugs.

---

## Phase 4 — Defect Backlog (`BUGS.md`)
Write confirmed bugs only, using a consistent template:
- ID, Title, Severity, Priority
- Environment
- Preconditions
- Steps to Reproduce
- Expected vs Actual
- Repro rate
- Evidence: screenshot IDs + brief console/network excerpt
- Notes (only if evidence-based)

**Severity rubric**
- Critical: cannot load / cannot run / hard crash / progression blocked
- High: core gameplay logic broken / frequent crashes / key metrics wrong
- Medium: partial feature failure / intermittent correctness issues / notable UI block
- Low: cosmetic, minor inconsistency, small UX issues

**Exit criteria**
- Each bug is reproducible or clearly marked intermittent.
- Each bug has evidence.

---

## Phase 5 — Fix + Verification Loop (`VERIFICATION.md`)
For each bug:
1. Create a targeted verification plan:
   - Minimal steps required to prove the fix
   - Which CP expectations must now pass
   - Required verification screenshots (new IDs, e.g., SS-101, SS-102)
2. After fix is applied:
   - Re-run minimal steps
   - Capture new screenshots at the same CPs
   - Compare against the same expectation statements
   - Update bug status: Open → Fix Applied → Verified Fixed (or Not Fixed)

**Verification status definitions**
- Open: bug exists
- Fix Proposed: fix guidance exists, not applied
- Fix Applied: code/config changed, not yet validated
- Verified Fixed: re-screenshotted + expectations pass
- Not Fixed: re-screenshotted but expectations still fail

**Exit criteria**
- Every bug has a verification record, even if not fixed.

---

## Final Reporting
Produce a short executive summary:
- What worked end-to-end
- Bugs by severity (counts + top 3 risks)
- Performance/reliability observations
- “Not Verified” areas and blockers

This workflow is designed to be deterministic and evidence-driven, using screenshots as the primary oracle for correctness.