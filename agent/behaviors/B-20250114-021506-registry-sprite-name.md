# Behavior B-20250114-021506-registry-sprite-name

**Phase:** 2 - Create Registry (Foundation)
**Priority:** HIGH
**Status:** DONE

## Behavior (Given/When/Then)

**Given** a part kind and deterministic seed
**When** `getSpriteNameForPart(partKind, seed)` is called
**Then** it returns the correct sprite asset name

## Planned Test

Test file: `src/partRegistry.test.js`
Test name: `getSpriteNameForPart returns sprite name for part kind`

## Rationale

Centralize duplicated sprite mapping logic that exists in renderWorld.js and buildCar.js. Additive change.

## Impact

Small additive change - adds function to registry. Independent of other modules.
