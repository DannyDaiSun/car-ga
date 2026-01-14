# Behavior B-20250114-021504-registry-visual-style

**Phase:** 2 - Create Registry (Foundation)
**Priority:** HIGH
**Status:** TODO

## Behavior (Given/When/Then)

**Given** a part kind string
**When** `getPartVisualStyle(partKind)` is called
**Then** it returns an object with fill, stroke, and accent colors

## Planned Test

Test file: `src/partRegistry.test.js` (NEW FILE)
Test name: `getPartVisualStyle returns style object for valid part kind`

## Rationale

Foundation for decoupling - create central registry without modifying existing code. This is purely additive and has no coupling to other modules yet.

## Impact

Smallest additive change - new file, no modifications to existing code. Completely independent.
