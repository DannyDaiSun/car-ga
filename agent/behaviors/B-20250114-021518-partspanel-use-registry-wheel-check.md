# Behavior B-20250114-021518-partspanel-use-registry-wheel-check

**Phase:** 5 - Migrate partsPanel
**Priority:** MEDIUM
**Status:** TODO

## Behavior (Given/When/Then)

**Given** partsPanel checks if a part is a wheel
**When** determining rendering approach
**Then** it uses partRegistry.isWheelKind() instead of local WHEEL_KINDS set

## Planned Test

Test file: `src/ui/partsPanel.test.js`
Test name: `partsPanel uses registry for wheel identification`

## Rationale

Centralize wheel kind checks. Removes local WHEEL_KINDS constant.

## Impact

Small - removes local set from partsPanel.js, uses registry. Depends on registry being complete.
