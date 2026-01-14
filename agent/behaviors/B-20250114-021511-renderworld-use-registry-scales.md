# Behavior B-20250114-021511-renderworld-use-registry-scales

**Phase:** 3 - Migrate renderWorld
**Priority:** MEDIUM
**Status:** DONE

## Behavior (Given/When/Then)

**Given** renderWorld needs to draw wheel details
**When** wheel detail scale is needed
**Then** it delegates to partRegistry.getWheelDetailScale()

## Planned Test

Test file: `src/render/renderWorld.test.js`
Test name: `renderWorld uses registry for wheel scales`

## Rationale

Remove local WHEEL_DETAIL_SCALE duplication, use central registry.

## Impact

Small - localized change in renderWorld.js. Depends on registry being complete.
