# Module Memory - User Interface (src/ui/)

> This file contains UI system knowledge and component structure.
> Update when UI layout, controls, or game state management changes.

## Module Purpose

**What this module does:** Implements the interactive user interface for the game. Manages game state, handles user input, and controls the parts purchasing/unlocking system. Main controller (`app.js`) orchestrates physics, rendering, and GA updates.

**Key responsibilities:**
- Game state management (generation, population, money, unlocked parts)
- User input handling (play/pause, speed control, part selection)
- Parts panel UI for purchasing/unlocking
- Integration of physics, rendering, and GA systems
- Simulation loop management

## Structure

```
src/ui/
├── app.js              # Main app controller & state
├── app.test.js         # App tests
├── partsPanel.js       # Parts UI & purchasing
├── partsPanel.test.js  # Parts panel tests
├── controls.js         # Input handling
├── controls.test.js    # Control tests
├── layout.js           # UI layout utilities
└── layout.test.js      # Layout tests
```

**Key files:**
- `app.js`: Main App class; orchestrates game loop, state, physics/render/GA
- `partsPanel.js`: Parts panel UI; displays parts, handles purchasing
- `controls.js`: Input event handlers (buttons, keyboard)
- `layout.js`: DOM layout helpers

## App Architecture

**Main Controller (app.js):**

The `App` class manages the entire simulation. Key properties:

```javascript
class App {
  // Simulation state
  world;           // Planck.js world
  cars = [];       // Active cars in simulation
  population = [];  // Current generation (DNA objects)

  // Game state
  generation = 1;
  money = 200;
  unlockedParts = new Set(['block', 'wheel', ...]);

  // GA settings
  popSize = 200;    // Population size
  mutRate = 0.05;   // Mutation rate
  maxParts = 12;    // Max parts per car

  // Rendering
  canvas;
  ctx;

  // Control state
  running = false;
  speed = 1;        // Simulation speed multiplier
}
```

**Game Loop:**
```
1. Call app.init() - Set up world, spawn first generation
2. Repeatedly:
   a. physics: simulateStep(world, cars, ...)
   b. GA: updateCarFitnesses (distance)
   c. render: render(canvas, cars, champion, ...)
   d. Check generation complete: all cars dead/stopped
   e. GA: nextGeneration(population, fitnesses)
   f. Spawn new generation
```

## Usage Patterns

**Common tasks:**

### Initialize Game
```javascript
import { App } from './ui/app.js';

const canvas = document.querySelector('canvas');
const app = new App(canvas, {
  popSize: 200,
  mutRate: 0.05,
  maxParts: 12
});

app.init();
app.start();  // Begin simulation loop
```

### Control Game
```javascript
app.pause();       // Pause simulation
app.resume();      // Resume
app.toggleSpeed(); // Change speed multiplier
app.nextGen();     // Force next generation
```

### Purchase/Unlock Parts
```javascript
app.tryBuyPart('jetpack');  // Attempt purchase
// Deducts money, unlocks part, updates UI
```

**Code patterns:**
- App instance holds all state; acts as central controller
- Physics/GA/Render are called each frame in sequence
- UI updates triggered by state changes (money, parts, generation)
- Event listeners for buttons/controls

## Dependencies

**Internal:**
- physics/*: Physics simulation
- ga/*: Genetic algorithm and evolution
- render/*: Canvas rendering
- gameConfig.js: Part definitions, economy
- partRegistry.js: Part metadata

**External:**
- planck-js: Physics engine
- HTML5 Canvas API
- DOM APIs

## Testing

**Test location:** `src/ui/*.test.js` (co-located)

**Running tests:**
```bash
npm run test -- src/ui
```

**Test patterns:**
- App initialization tests
- State update tests (money, parts unlocking)
- UI interaction tests (button clicks, input)
- Integration tests (full game loop cycle)

## API / Interface

**app.js (App class):**
- `constructor(canvas, options)`: Create app instance
- `init()`: Initialize physics world, spawn first generation
- `start()`: Begin simulation loop (requestAnimationFrame)
- `pause()`: Pause simulation
- `resume()`: Resume simulation
- `nextGen()`: Force next generation
- `toggleSpeed()`: Cycle through speed multipliers (1x, 2x, 4x)
- `tryBuyPart(partId)`: Attempt to purchase/unlock part
- `update()`: Single frame update (physics, GA, render)

**partsPanel.js:**
- `renderPartsPanel(unlockedParts, money)`: Update UI display
- `attachPartClickListeners(app)`: Bind purchase events
- `updateMoneyDisplay(money)`: Update money UI

**controls.js:**
- `attachPlayPauseButton(app)`: Bind play/pause button
- `attachSpeedButton(app)`: Bind speed control button
- `attachNextGenButton(app)`: Bind next generation button
- `attachPartClickListeners(app)`: Bind part purchase buttons

**layout.js:**
- `setupLayout()`: Initialize DOM structure
- `getCanvas()`: Get canvas element

## Configuration

**Settings:**
- Default population size: 200 cars
- Default mutation rate: 0.05 (5%)
- Default max parts: 12 parts per car
- Starting money: 200 currency
- All parts unlocked from start (configurable)

**Speed Multipliers:** 1x, 2x, 4x simulation speed

## Economy System

**Money Flow:**
- Starting: 200 currency
- Per milestone (30 meters): 30 currency
- Part prices in PART_DEFINITIONS: 0-300 currency

**Part Purchasing:**
- Player can buy to unlock new part types
- Once unlocked, parts appear in evolved cars
- Part availability controlled by `unlockedParts` Set

**Available Parts (as of 2025-01-14):**
- block: 0 (always available)
- wheel: 0 (always available)
- big_wheel: 100
- long_body: 150
- small_wheel: 75
- tiny_wheel: 125
- jetpack: 300

## Car Spawning & Lifecycle

**Spawning:**
- Staggered: 10 cars per frame to prevent frame rate drops
- Position: Scattered along track start
- DNA: From current population (evolved genetically)

**Lifecycle:**
- Alive: Moving, evolving distance
- Dead conditions:
  - Stopped (velocity < threshold for 3+ seconds)
  - All wheels broken (optional)
  - Fell off track (Y too low)
- Fitness: Maximum X distance reached

**Generation Completion:**
- When all cars dead or stopped
- Fitnesses calculated (distance)
- Selection + mutation creates next generation
- New population ready for spawning

## Game State Management

**Current State:**
- `generation`: Current generation number
- `money`: Available currency
- `unlockedParts`: Set of unlocked part IDs
- `population`: Array of current generation DNA
- `cars`: Array of live car objects in simulation
- `running`: Boolean simulation state
- `speed`: Speed multiplier (1, 2, 4)

**State Updates:**
- Money increments on milestones (30m)
- Parts unlocked via purchase
- Generation increments on evolution
- Cars array populated on spawn, cleared on death

## Known Issues & Workarounds

- **Frame drops on spawn**: Staggered spawning (10/frame) mitigates; adjust CARS_PER_FRAME
- **UI responsiveness**: Large populations can slow updates; consider debouncing UI refreshes
- **Money accumulation**: Milestone triggers can be rapid on good runs; consider cooldowns
- **Part balance**: Expensive parts (jetpack) may take multiple generations to afford

## Recent Changes

- [2025-01-14] All parts unlocked from start for testing
- [2025-01-14] Population set to 60 for balance testing
- [2025-01-14] Economy system integrated with milestone tracking
- [2025-01-08] Speed control added (1x, 2x, 4x)
- Previous: Basic app controller and UI

---
*Last updated: 2025-01-14 - Documented App architecture, economy system, and game state management*
