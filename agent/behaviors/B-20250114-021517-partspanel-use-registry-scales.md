# Behavior B-20250114-021517-partspanel-use-registry-scales

**Phase:** 5 - Migrate partsPanel
**Priority:** MEDIUM
**Status:** DONE

## Behavior (Given/When/Then)

**Given** partsPanel draws wheel icon details
**When** calculating detail circle radius
**Then** it uses partRegistry.getWheelDetailScale() instead of local constant

## Planned Test

Test file: `src/ui/partsPanel.test.js`
Test name: `partsPanel uses registry for wheel scales`

## Rationale

Eliminate duplication of WHEEL_DETAIL_SCALE constant.

## Impact

Small - removes local constant from partsPanel.js, uses registry. Depends on registry being complete.
