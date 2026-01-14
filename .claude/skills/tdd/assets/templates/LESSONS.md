# Verified Project Lessons

This is an append-only log of lessons learned during development.
Only add entries when verified by evidence (test results, runtime data, etc.).

## Format

For each lesson, use this structure:

```
## YYYY-MM-DD - Lesson Title

**Context**: What was happening / what was being attempted

**Discovery**: What was learned / observed

**Evidence**: Test results, data, error messages, or other concrete observations

**Action**: What to do differently going forward
```

---

## Example Entry

## 2025-01-14 - Mutation Operators Need Bounds Checking

**Context**: Implementing genetic algorithm mutation for car evolution

**Discovery**: Mutations were creating invalid DNA values outside allowed ranges

**Evidence**: 
- Tests failing: `test_mutation_stays_within_bounds`
- 23% of mutations resulted in values > 1.0 or < 0.0
- Caused physics engine crashes

**Action**: Always clamp mutated values to [0.0, 1.0] range in mutation operator

---
