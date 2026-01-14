Test: src/partRegistry.test.js (behaviors 7-10 combined)
Runtime: 4ms for all 6 tests
Cause hypothesis: Simple object lookups and function calls with minimal overhead
Mitigation tried: None - acceptable runtime for registry lookup tests
Before/After: Initial measurement at 4ms for full test file

Tests included:
- getSpriteNameForPart returns sprite name for part kind
- getShapeType returns correct shape for part kinds
- isWheelKind identifies wheel parts correctly
- hasMotor returns true for all wheel types
