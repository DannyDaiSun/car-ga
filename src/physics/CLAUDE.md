# Module Memory - Physics Simulation (src/physics/)

> This file contains physics simulation knowledge and Planck.js integration details.
> Update when physics behavior, jetpack mechanics, or track generation changes.

## Module Purpose

**What this module does:** Implements the physics simulation using Planck.js 2D rigid body physics engine. Builds car structures from DNA, simulates movement, handles collisions, and manages special mechanics like the jetpack energy system.

**Key responsibilities:**
- Convert car DNA into Planck.js bodies and constraints
- Simulate physics step (gravity, forces, constraints)
- Track generation and terrain management
- Jetpack energy system (thrust, energy consumption, recharge)
- Car state updates (position, distance, velocity)

## Structure

```
src/physics/
├── buildCar.js         # Convert DNA → Planck bodies
├── buildCar.test.js    # Car building tests
├── jetpack.js          # Jetpack energy system
├── jetpack.test.js     # Jetpack tests
├── simulate.js         # Physics step, car updates
├── simulate.test.js    # Simulation tests
├── track.js            # Track generation
├── track.test.js       # Track tests
└── assetDimensions.json # Asset metadata
```

**Key files:**
- `buildCar.js`: Takes DNA and creates Planck.js bodies (parts) and joints (connections)
- `jetpack.js`: Energy tracking, thrust application, recharge logic
- `simulate.js`: Main physics loop; updates car positions, handles wheels, applies jetpack
- `track.js`: Procedural track generation for terrain

## Physics Engine Details

**Planck.js Setup:**
- Units: Meters (1 unit = 1 meter in simulation)
- Canvas rendering: 20 pixels per meter (SCALE = 20 in buildCar.js)
- World gravity: 9.81 m/s² downward
- Default damping: linear 0.1, angular 0.05

**Collision Filtering:**
- Category 1 (0x0001): Ground/track (static bodies)
- Category 2 (0x0002): Car parts (dynamic bodies)
- Cars collide with ground only (no car-to-car collisions currently)

**Car Structure:**
- Root part (id: 0): Main body (block)
- Child parts: Connected via constraints (weld or revolute joints)
- Wheels: Revolute joints with motors for torque
- Tree structure: No cycles, parent must exist before child

## Usage Patterns

**Common tasks:**

### Building a Car from DNA
```javascript
import { buildCar } from './buildCar.js';
import * as planck from 'planck-js';

const world = planck.World({ gravity: [0, -9.81] });
const carId = 1;
const position = planck.Vec2(0, 10);
const dna = { parts: [...], joints: [...] };

const car = buildCar(world, dna, position, carId);
// Returns: { parts (Map), joints (Array), rootBody, wheels (Array) }
```

### Simulating Physics Step
```javascript
import { simulateStep } from './simulate.js';

const cars = [...];
const trackHeightFn = (x) => track.getTrackHeight(x);

// Advance physics
simulateStep(world, cars, trackHeightFn, deltaTime);

// Cars now have updated position, velocity, distance, isAlive
```

### Jetpack Energy Management
```javascript
import { updateJetpackEnergy, canJetpackThrust, isJetpackBoostActive } from './jetpack.js';

// On each physics step
updateJetpackEnergy(car, isInContact, deltaTime);

// Check if can thrust
if (canJetpackThrust(car)) {
  // Apply jetpack thrust to car body
}

// Check active boost state for UI
if (isJetpackBoostActive(car)) {
  // Show jetpack indicator
}
```

**Code patterns:**
- Planck.js bodies created with initial position and properties
- User data attached to bodies: `{ carId, partId, kind, ... }`
- Physics step called once per frame with deltaTime
- Car objects maintain state: position, velocity, distance, energy (if jetpack)

## Dependencies

**Internal:**
- gameConfig.js: PART_DEFINITIONS for part properties
- partRegistry.js: Part metadata and properties

**External:**
- planck-js: 2D physics engine

## Jetpack System Details (as of 2025-01-14)

**Energy Mechanics:**
- Max Energy: 100 units
- Energy Consumption: 50 units/second while thrusting
- Recharge Rate: 80 units/second when in contact with track
- Thrust Force: 200 Newtons

**Boost Timing:**
- Boost Interval: 3.0 seconds between boosts
- Boost Duration: 0.3 seconds per thrust
- Recharge During Boost: Only recharges when wheels touch track

**Implementation:**
- Energy tracked per car object: `car.jetpackEnergy` (0-100)
- Contact state: `car.jetpackInContact` (boolean, updated by physics)
- Boost active: `car.jetpackBoostActive` (boolean)
- Thrust application: Adds force to root body when boosting

**Code Flow:**
1. Check wheel-track contact (physics system)
2. Update energy based on contact state and thrust
3. Decay boost active state
4. Apply thrust force if boost active AND energy available
5. Monitor energy exhaustion for car death

## Track System

**Track Generation:**
- Procedurally generated using noise functions
- Track height: `getTrackHeight(x)` returns Y position at given X
- Starts at origin, extends infinitely to the right
- Terrain features: Hills, valleys, jumps

**Collision Detection:**
- Ground bodies created in segments as cars move right
- Static bodies positioned at track surface
- Wheels detect contact with ground segments

## Testing

**Test location:** `src/physics/*.test.js` (co-located)

**Running tests:**
```bash
npm run test -- src/physics
```

**Test patterns:**
- Unit tests verify car building from DNA
- Integration tests simulate cars moving and colliding
- Jetpack energy tests verify consumption/recharge logic
- Track tests verify height function and collision

## API / Interface

**buildCar.js:**
- `buildCar(world, dna, position, carId)`: Create Planck bodies from DNA
  - Returns: `{ parts (Map), joints (Array), rootBody, wheels (Array) }`

**jetpack.js:**
- `updateJetpackEnergy(car, isInContact, deltaTime)`: Update energy state
- `canJetpackThrust(car)`: Boolean if car can thrust now
- `isJetpackBoostActive(car)`: Boolean if currently thrusting
- `applyJetpackThrust(car)`: Apply thrust force to root body
- `initializeJetpackEnergy(car)`: Set up energy on car creation

**simulate.js:**
- `simulateStep(world, cars, trackHeightFn, deltaTime)`: Advance physics
  - Updates: car positions, velocities, distances, alive status
- `updateCarState(car, trackHeightFn)`: Update individual car after step
- `applyWheelTorque(body, wheelDef)`: Apply motor torque to wheel

**track.js:**
- `createTrack(canvasWidth)`: Initialize track geometry
- `getTrackHeight(x)`: Get Y position at given X coordinate
- `updateTrackBodies(world, champion, cars)`: Create/destroy ground bodies as needed

## Configuration

**Physics Constants (in code):**
- SCALE = 20 (pixels per meter)
- Gravity = 9.81 m/s²
- Default linear damping = 0.1
- Default angular damping = 0.05

**Car Culling (in app.js):**
- Cull distance: 250m behind champion
- Reactivate distance: 150m closer
- Min velocity to cull: 0.3 m/s
- Drag factor: 0.96 (velocity decay)

## Domain Logic

**Physics Simulation Loop:**
1. Advance Planck.js world by deltaTime
2. Update each car's position from body
3. Check track contact for wheels
4. Update car state: distance, velocity, alive
5. Handle jetpack energy/thrust
6. Cull cars far behind champion

**Wheel Motor System:**
- Each wheel is a revolute joint with motor
- Motor applies torque to create rotation
- Torque = wheel property × motor multiplier from gameConfig
- Prevents wheels from slipping on flat terrain

**Air Friction (as of 2025-01-14):**
- Applied to non-wheeled vehicles in air
- Makes flying cars descend quickly
- Velocity decay factor: 0.96 per frame
- Improves jetpack control and realism

## Known Issues & Workarounds

- **Planck.js precision**: Very large forces or small bodies can cause instability
- **Wheel penetration**: Occasional wheel-body collision on bumpy terrain; mitigated by damping
- **Jetpack recharge edge case**: Energy only recharges when ANY wheel touches track
- **Performance**: 200+ cars can cause slowdown; use car culling system

## Recent Changes

- [2025-01-14] Air friction implemented for faster descent when flying
- [2025-01-14] Jetpack energy system with track recharge (80/sec while grounded, 50/sec consumption)
- [2025-01-14] Car culling optimized: directional culling, staggered car creation
- [2025-01-08] Physics simulation refactored for clarity
- Previous: Basic car building and wheel physics

---
*Last updated: 2025-01-14 - Documented jetpack energy system, air friction, and car culling optimizations*
