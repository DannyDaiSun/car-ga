# Behavior B-20250114-021512-renderworld-use-registry-sprites

**Phase:** 3 - Migrate renderWorld
**Priority:** MEDIUM
**Status:** TODO

## Behavior (Given/When/Then)

**Given** renderWorld needs to select a sprite for a part
**When** sprite name is determined
**Then** it uses partRegistry.getSpriteNameForPart()

## Planned Test

Test file: `src/render/renderWorld.test.js`
Test name: `renderWorld uses registry for sprite mapping`

## Rationale

Remove duplicated sprite mapping logic. Breaks coupling point between render and sprite selection.

## Impact

Medium - refactors renderSprite() function in renderWorld.js. Depends on registry being complete.
