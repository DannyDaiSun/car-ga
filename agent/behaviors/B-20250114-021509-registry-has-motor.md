# Behavior B-20250114-021509-registry-has-motor

**Phase:** 2 - Create Registry (Foundation)
**Priority:** HIGH
**Status:** TODO

## Behavior (Given/When/Then)

**Given** a part kind
**When** `hasMotor(partKind)` is called
**Then** it returns true for all wheel types, false for others

## Planned Test

Test file: `src/partRegistry.test.js`
Test name: `hasMotor returns true for all wheel types`

## Rationale

Centralize motor enablement logic and fix the small_wheel/tiny_wheel bug systematically. Additive change.

## Impact

Small additive change - adds function to registry. This provides the foundation for fixing the motor bug in a maintainable way.
