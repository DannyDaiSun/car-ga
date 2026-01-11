# Verification Plans

## Bug: QA-001 (Cars spawn too low/drop immediately)
**Status**: Re-opened (User Report)

### Plan
1. Capture detailed sequence at t=0, t=100ms, t=500ms.
2. Check y-position of cars visual vs track.
3. Verify if cars collide or tunnel.

### Verification Log
### Verification Log
- **Run 1 (Initial Fix y=10)**: User reported issue persists. Re-testing.
- **Run 2 (Collision Fix)**: Removed `filterGroupIndex` from track. Captured t=0, 50, 500ms. Cars visible and stable. Active count high.
- **Result**: PASSED. Root cause was collision filtering, not just spawn height.
