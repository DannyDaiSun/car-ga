# QA Workflow for Web Game

## 1) Prepare
- Identify build/version and target environment(s).
- Ensure deterministic test settings where possible (seed, fixed params).
- Define acceptance criteria for "works" (load, run, generation progress, stable metrics).

## 2) Execute Phased Testing
- **Smoke & Load**: Basic health check.
- **Core Functional**: Gameplay loop verification.
- **UX/UI**: Interface quality.
- **Reliability/Perf soak**: Stability over time.
- **Negative/Edge cases**: Robustness.

## 3) Capture Evidence
- Console errors, network failures, screenshots, and reproduction steps.
- Track seeds/params for every run.

## 4) Triage
- Assign Severity + Priority using a consistent rubric.
- Group issues by subsystem (rendering, physics, GA logic, UI controls, persistence, perf).

## 5) Report
- Maintain `qa/BUGS.md` as the living defect backlog.
- Maintain `qa/RUN_LOG.jsonl` as the execution trace.

## 6) Verify Fixes
- For each fixed bug, add a short "Verification Note" with:
    - build/version tested
    - steps repeated
    - repro rate after fix (should be 0/N)

## 7) Regression Suite
- Convert previously found critical bugs into a small regression checklist.
- Run the regression checklist before every release/tag.

## 8) Automated Verification Patterns
- Use `browser_subagent` for end-to-end flows.
- **Green State Baseline**:
  - **URL**: `http://localhost:5173/`
  - **Console**: No Errors.
  - **Canvas**: `#world` visibility.
  - **Gameplay**: `Population > 0`, `Generation` increments > 0.
- **Recommended Tool Usage**:
  - `browser_get_dom`: Check element existence (ids, accessibility labels).
  - `execute_browser_javascript`: Verify internal state (e.g., `world.cars.length`, `speedSlider.value`) and canvas pixel data.
  - `capture_browser_screenshot`: Visual proof for artifacts and regression comparison.
