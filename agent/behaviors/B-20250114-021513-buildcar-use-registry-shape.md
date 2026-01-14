# Behavior B-20250114-021513-buildcar-use-registry-shape

**Phase:** 4 - Migrate buildCar (Break Physics-Render Coupling)
**Priority:** HIGH
**Status:** DONE

## Behavior (Given/When/Then)

**Given** buildCar creates a physics body for a part
**When** determining the fixture shape
**Then** it uses partRegistry.getShapeType() instead of checking kind directly

## Planned Test

Test file: `src/physics/buildCar.test.js`
Test name: `buildCar uses registry for shape selection`

## Rationale

Centralize shape type logic. Removes hardcoded shape checks from physics module.

## Impact

Small - localized change in buildCar.js line 95. Depends on registry being complete.
