# Behavior B-20250114-021515-buildcar-use-registry-dimensions

**Phase:** 4 - Migrate buildCar (Break Physics-Render Coupling)
**Priority:** HIGH
**Status:** DONE

## Behavior (Given/When/Then)

**Given** buildCar needs visual dimensions for physics sizing
**When** calculating body dimensions
**Then** it uses partRegistry.getSpriteDimensions() which internally handles assetDimensions

## Planned Test

Test file: `src/physics/buildCar.test.js`
Test name: `buildCar uses registry for sprite dimensions`

## Rationale

Remove render concern (assetDimensions.json) from physics module. Breaks physics-render coupling.

## Impact

Medium - removes direct import of assetDimensions.json from buildCar.js, delegates to registry. Depends on registry being complete.
