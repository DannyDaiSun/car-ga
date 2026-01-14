# Behavior B-20250114-021516-partspanel-use-registry-styles

**Phase:** 5 - Migrate partsPanel
**Priority:** MEDIUM
**Status:** TODO

## Behavior (Given/When/Then)

**Given** partsPanel renders part icons
**When** determining icon fill/stroke colors
**Then** it uses partRegistry.getPartVisualStyle() instead of local ICON_STYLE_MAP

## Planned Test

Test file: `src/ui/partsPanel.test.js`
Test name: `partsPanel uses registry for icon styles`

## Rationale

Eliminate last duplication of style map. Ensures UI and render use same styles.

## Impact

Small - removes ICON_STYLE_MAP from partsPanel.js, uses registry. Depends on registry being complete.
