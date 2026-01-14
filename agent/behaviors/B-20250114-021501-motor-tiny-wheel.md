# Behavior B-20250114-021501-motor-tiny-wheel

**Phase:** 1 - Critical Bug Fixes
**Priority:** CRITICAL
**Status:** TODO

## Behavior (Given/When/Then)

**Given** a car is built with a tiny_wheel part
**When** the revolute joint is created for the tiny_wheel
**Then** the joint has enableMotor set to true

## Planned Test

Test file: `src/physics/buildCar.test.js`
Test name: `tiny_wheel parts have motors enabled`

## Rationale

Critical bug - tiny_wheel parts currently cannot move because motors are not enabled in buildCar.js:173. Only 'wheel' and 'big_wheel' are checked, but 'small_wheel' and 'tiny_wheel' are missing.

## Impact

Smallest and most critical - fixes broken gameplay for tiny_wheel parts. This is a localized change to one condition in buildCar.js.
