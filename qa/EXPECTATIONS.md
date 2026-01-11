# QA Expectations Catalogue

## Critical Points (CPs)

### CP-01: Landing/Loaded
- **Visible UI**: Canvas present, "Genetic Car Evolution" title in sidebar, Controls (Pause, Reset, Speed) visible.
- **Behavior**: Simulation should be running (Time > 0) or ready to start.
- **No Failures**: No blank screen, no console errors.

### CP-02: Spawn / Gen Start
- **Visible UI**: Cars (red/grey shapes) visible at x=0.
- **Behavior**: Cars should spawn above the track and *fall* onto it, then drive.
- **No Failures**: Cars should NOT disappear immediately. Cars should NOT fall through the track. Cars should NOT appear already "dead" or stuck inside geometry.

### CP-03: Mid-run (Generation Active)
- **Behavior**: Cars moving right (x increasing). Best Fitness increasing.
- **Visible UI**: Active count > 0. Generation counter visible.
- **No Failures**: Simulation should not freeze.

### CP-04: Generation End / Transition
- **Behavior**: When all cars die or time limit reached, a new generation should start.
- **Visible UI**: Generation counter increments (e.g., Gen 1 -> Gen 2). Cars respawn at start.
- **No Failures**: No infinite loop or "stuck" state between generations.

### CP-05: Simulation Stop/Reset
- **Behavior**: Clicking Reset should clear current state and restart at Gen 1 (or Gen 0).
- **Visible UI**: Generation reset to 1. Best fitness reset.
- **No Failures**: Canvas shouldn't go blank.

### CP-06: Controls Functionality
- **Behavior**: Pause stops updates (Time counter freezes). Speed slider changes simulation speed.
- **No Failures**: UI buttons should remain responsive.
