# Behavior B-20250114-021507-registry-shape-type

**Phase:** 2 - Create Registry (Foundation)
**Priority:** HIGH
**Status:** TODO

## Behavior (Given/When/Then)

**Given** a part kind
**When** `getShapeType(partKind)` is called
**Then** it returns 'circle' for wheel types and 'box' for others

## Planned Test

Test file: `src/partRegistry.test.js`
Test name: `getShapeType returns correct shape for part kinds`

## Rationale

Centralize shape type determination logic currently in buildCar.js. Additive change.

## Impact

Small additive change - adds function to registry. Independent of other modules.
