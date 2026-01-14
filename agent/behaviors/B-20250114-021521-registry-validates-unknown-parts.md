# Behavior B-20250114-021521-registry-validates-unknown-parts

**Phase:** 7 - Validation (Optional Enhancement)
**Priority:** LOW
**Status:** TODO

## Behavior (Given/When/Then)

**Given** an invalid/unknown part kind string
**When** any registry function is called with it
**Then** it returns a sensible default or throws a clear error

## Planned Test

Test file: `src/partRegistry.test.js`
Test name: `registry handles unknown part kinds gracefully`

## Rationale

Fail fast on configuration errors. Add runtime validation to catch mistakes early.

## Impact

Small - adds validation to registry functions. Purely additive enhancement. Depends on registry being complete.
