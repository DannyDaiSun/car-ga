# Behavior B-20250114-021508-registry-is-wheel

**Phase:** 2 - Create Registry (Foundation)
**Priority:** HIGH
**Status:** TODO

## Behavior (Given/When/Then)

**Given** a part kind string
**When** `isWheelKind(partKind)` is called
**Then** it returns true for all wheel variants, false otherwise

## Planned Test

Test file: `src/partRegistry.test.js`
Test name: `isWheelKind identifies wheel parts correctly`

## Rationale

Replace scattered checks for wheel types across multiple files. Additive change.

## Impact

Small additive change - adds function to registry. Independent of other modules.
