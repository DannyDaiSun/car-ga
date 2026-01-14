---
name: tdd
description: Behavior-driven Test-Driven Development (TDD) workflow with strict unit test discipline and evidence-based project learning. Use when adding new features, fixing bugs, or working on any code changes in a project. Automatically applies when user requests feature implementations, bug fixes, refactoring, or code development tasks.
---

# Test-Driven Development (TDD)

Behavior-driven TDD methodology with one-assertion-per-test discipline, commit-per-behavior workflow, and durable project learning capture.

## Core Principles

### Behavior-Driven Development
A **behavior** is the smallest independently verifiable statement of expected system outcome that can be validated by one unit test with one assertion.

Write behaviors in Given/When/Then format or as clear outcome statements:
- "Given a user is logged in, when they click logout, then the session is cleared"
- "API returns 404 status for requests with invalid IDs"
- "Calculator adds two positive integers correctly"

### One Assertion Per Test
Each unit test must have **exactly one assertion line**:
- ✅ `expect(result).toBe(5)`
- ✅ `assert.Equal(t, expected, actual)`
- ✅ `self.assertEqual(result, expected)`
- ❌ Multiple assertions in one test
- ❌ Assertions hidden in helper functions
- ❌ Table-driven parameterized tests

**Exception**: Snapshot tests are permitted when render-related or when unit tests are not feasible, but still require one assertion (e.g., `expect(rendered).toMatchSnapshot()`).

### Commit Discipline
Commit after each completed behavior when all tests pass:
```bash
git commit -m "B-<behavior-id>: <behavior description>"
```

Behavior IDs must be globally unique (use timestamps to avoid conflicts).

## Workflow Decision Tree

```
┌─────────────────────────────┐
│   What are you doing?       │
└─────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
  Feature      Bug?
     │           │
     v           v
Add New      Fix Bug
 Behavior    Workflow
     │           │
     v           v
[Step 1]    [Bug Fix]
```

## Workflow 1: Adding New Features

### Step 1: Initialize TDD Workflow (First Time Only)

If starting fresh in a project, initialize the TDD artifact structure:

```bash
python3 scripts/init_tdd.py
```

Optional arguments:
- `--artifacts-dir DIR` - Custom artifacts directory (default: `agent`)
- `--framework FRAMEWORK` - Test framework (vitest, jest, pytest, junit, go, etc.)
- `--test-command CMD` - Custom test command
- `--threshold MS` - Slow test threshold in milliseconds (default: 100)

This creates:
```
project/
├── agent/                         # or custom directory
│   ├── tdd.config.json            # Configuration
│   ├── BEHAVIOR_BACKLOG.md        # Behavior index
│   ├── LESSONS.md                 # Verified learnings
│   ├── TEST_RUNTIME.md            # Legacy slow test log
│   ├── behaviors/                 # Individual behavior files
│   └── test-runtime/              # Per-test runtime logs
```

**Configuration**: See `references/config_schema.md` for detailed configuration options.

### Step 2: Identify and Create Behavior

For each piece of functionality, create a behavior:

```bash
python3 scripts/create_behavior.py "User can reset the game timer" \
  --test-file src/timer.test.js
```

This creates:
1. A behavior file in `behaviors/B-<timestamp>-<slug>.md`
2. A row in `BEHAVIOR_BACKLOG.md`

**Manual creation** is also fine - see `assets/templates/behavior_template.md` for the format.

### Step 3: Write Failing Test

Write a test that:
1. Lives in the test file specified in the behavior
2. Has exactly one assertion
3. Currently fails (red)

Example (JavaScript/Vitest):
```javascript
import { describe, it, expect } from 'vitest';
import { resetTimer } from './timer.js';

describe('Timer', () => {
  it('should reset to zero when reset is called', () => {
    const timer = createTimer(100);
    resetTimer(timer);
    expect(timer.value).toBe(0);  // One assertion
  });
});
```

Example (Python/Pytest):
```python
def test_reset_timer_returns_to_zero():
    timer = create_timer(100)
    reset_timer(timer)
    assert timer.value == 0  # One assertion
```

Run tests to verify it fails:
```bash
npm run test  # or pytest, go test, etc.
```

### Step 4: Write Minimal Code

Implement the minimal code needed to make the test pass. Do not add extra functionality.

```javascript
export function resetTimer(timer) {
  timer.value = 0;
}
```

### Step 5: Run Tests

Run all tests to ensure:
1. The new test passes (green)
2. No existing tests broke (regression check)

```bash
npm run test
```

### Step 6: Update Behavior Status

Update the behavior file and backlog:

**In `behaviors/B-<id>.md`:**
```markdown
## Status
🟢 Complete

## Test
- **File**: src/timer.test.js
- **Name**: should reset to zero when reset is called
- **Assertion**: `expect(timer.value).toBe(0)`
```

**In `BEHAVIOR_BACKLOG.md`:**
Change status from 🔴 to 🟢 and fill in test details.

### Step 7: Commit

Commit with the behavior ID:
```bash
git add .
git commit -m "B-20250114-153045-reset-timer: User can reset the game timer"
```

### Step 8: Detect Slow Tests

After tests run, check for slow tests:
```bash
npm run test | python3 scripts/detect_slow_tests.py
```

This creates individual files in `test-runtime/` for tests exceeding the threshold. Fixing slow tests can be deferred until end of feature work.

### Step 9: Capture Lessons (When Applicable)

If you discovered something important (unexpected behavior, common pitfall, performance insight), add it to `LESSONS.md`:

```markdown
## 2025-01-14 - Timer Reset Requires State Validation

**Context**: Implementing timer reset functionality

**Discovery**: Resetting without validating timer state caused crashes

**Evidence**: 
- Tests failed with null pointer exceptions
- 15% of reset calls occurred on uninitialized timers
- Error logs showed timer.value = null

**Action**: Always check timer existence before reset operations
```

Only add lessons when you have concrete evidence (test results, error data, measurements).

### Step 10: Repeat

Continue with the next smallest behavior until the feature is complete.

## Workflow 2: Fixing Bugs

### Step 1: Reproduce

1. Reproduce the bug locally
2. Understand the failure conditions
3. Document reproduction steps

### Step 2: Create Behavior

Create a behavior for the expected (correct) behavior:
```bash
python3 scripts/create_behavior.py "Timer displays correctly after midnight rollover" \
  --test-file src/timer.test.js
```

### Step 3: Write Failing Test

Write a test that fails due to the bug:
```javascript
it('should handle midnight rollover correctly', () => {
  const timer = createTimer(new Date('2025-01-14T23:59:59'));
  timer.tick();
  expect(timer.display()).toBe('2025-01-15T00:00:00');
});
```

Verify it fails (demonstrates the bug exists).

### Step 4: Fix Minimal

Implement the minimal fix to make the test pass.

### Step 5: Run All Tests

Ensure the fix works and doesn't break anything else:
```bash
npm run test
```

### Step 6: Update and Commit

Update behavior status and commit:
```bash
git commit -m "B-20250114-160000-midnight-rollover: Timer displays correctly after midnight rollover"
```

### Step 7: Document Lesson

If the bug revealed something important, add to `LESSONS.md` with evidence.

## Bundled Resources

### Scripts

**init_tdd.py** - Initialize TDD workflow structure
```bash
python3 scripts/init_tdd.py --framework vitest --threshold 50
```

**create_behavior.py** - Create new behavior files
```bash
python3 scripts/create_behavior.py "Description" --test-file path/to/test.js
```

**detect_slow_tests.py** - Detect and log slow tests
```bash
npm run test | python3 scripts/detect_slow_tests.py
```

**validate_backlog.py** - Validate artifact consistency
```bash
python3 scripts/validate_backlog.py --strict
```

### References

**test_frameworks.md** - Commands and patterns for all major test frameworks (Vitest, Jest, Pytest, JUnit, Go, RSpec, xUnit, Cargo)

**config_schema.md** - Complete configuration reference with examples for different project types

### Templates

**assets/templates/** - Template files for all TDD artifacts:
- `BEHAVIOR_BACKLOG.md` - Behavior index template
- `LESSONS.md` - Lessons log template
- `TEST_RUNTIME.md` - Test runtime log template
- `behavior_template.md` - Individual behavior file template
- `tdd.config.json` - Configuration template

## Test Framework Support

Supports all major frameworks with appropriate test commands:

**JavaScript/TypeScript**: Vitest, Jest, Mocha
**Python**: Pytest, Unittest
**Java**: JUnit, TestNG (Maven/Gradle)
**Go**: go test
**Ruby**: RSpec
**C#**: xUnit, NUnit
**Rust**: cargo test

See `references/test_frameworks.md` for framework-specific commands and output patterns.

## Best Practices

1. **Start with smallest behavior** - Choose the behavior requiring the least code change
2. **One assertion per test** - Strictly enforce single assertion rule
3. **Commit after each behavior** - Never batch multiple behaviors
4. **Evidence-based lessons** - Only document learnings with concrete evidence
5. **Fix slow tests** - Address performance issues before declaring work complete
6. **Validate regularly** - Run `validate_backlog.py` to check artifact consistency

## Common Patterns

### Behavior Examples
- "Calculator adds two positive integers correctly"
- "API returns 404 for non-existent resource"
- "User sees error message when form validation fails"
- "Database connection retries on timeout"

### Status Indicators
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⚪ Deferred

### Commit Message Format
```
B-<timestamp>-<slug>: <behavior description>

Example:
B-20250114-153045-user-login: User can log in with valid credentials
```
