Test: src/render/renderWorld.test.js > renderWorld uses registry for part styles
Runtime: 3ms (shared with other tests in file)
Cause hypothesis: Simple delegation with minimal overhead
Mitigation tried: None - acceptable runtime for delegation test
Before/After: Test file runtime remains at 3ms

Behaviors 11-12 combined:
- renderWorld now delegates getPartRenderStyle to partRegistry.getPartVisualStyle
- renderWorld now delegates getWheelDetailScale to partRegistry.getWheelDetailScale
- Removed duplicate PART_STYLE_MAP and WHEEL_DETAIL_SCALE constants
