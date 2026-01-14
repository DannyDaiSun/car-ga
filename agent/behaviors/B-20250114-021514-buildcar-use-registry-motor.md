# Behavior B-20250114-021514-buildcar-use-registry-motor

**Phase:** 4 - Migrate buildCar (Break Physics-Render Coupling)
**Priority:** HIGH
**Status:** DONE

## Behavior (Given/When/Then)

**Given** buildCar creates a joint for a child part
**When** determining if motor should be enabled
**Then** it uses partRegistry.hasMotor() instead of checking specific kinds

## Planned Test

Test file: `src/physics/buildCar.test.js`
Test name: `buildCar uses registry for motor enablement`

## Rationale

This systematically fixes the small_wheel/tiny_wheel motor bug and makes motor logic maintainable.

## Impact

Small - refactors line 173 in buildCar.js. Depends on registry being complete. This is the systematic fix for the motor bug.
