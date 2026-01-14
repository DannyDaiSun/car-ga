# Behavior B-20250114-021502-wheel-circle-shape

**Phase:** 1 - Critical Bug Fixes
**Priority:** HIGH
**Status:** TODO

## Behavior (Given/When/Then)

**Given** a car is built with a wheel part (any wheel type)
**When** the physics body is created
**Then** the body has a Circle fixture shape

## Planned Test

Test file: `src/physics/buildCar.test.js`
Test name: `wheel parts get Circle shape fixture`

## Rationale

Verification test - document existing behavior to prevent regression. Currently no tests exist for buildCar.js shape selection logic.

## Impact

Smallest - no code changes, just adds test coverage for existing behavior. Independent of other behaviors.
