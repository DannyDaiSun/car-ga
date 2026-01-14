# Behavior B-20250114-021505-registry-wheel-scale

**Phase:** 2 - Create Registry (Foundation)
**Priority:** HIGH
**Status:** TODO

## Behavior (Given/When/Then)

**Given** a wheel part kind
**When** `getWheelDetailScale(partKind)` is called
**Then** it returns the correct numeric scale factor for that wheel type

## Planned Test

Test file: `src/partRegistry.test.js`
Test name: `getWheelDetailScale returns correct scale for wheel types`

## Rationale

Consolidate duplicated WHEEL_DETAIL_SCALE constant that exists in multiple files. Additive change.

## Impact

Small additive change - adds function to existing registry file. Independent of other modules.
