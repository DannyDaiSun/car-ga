# Project Memory - car-ga

> This file helps Claude quickly understand the car-ga project structure and conventions.
> Update this file when project-wide decisions, architecture, or conventions change.

## Project Overview

**Description:** Genetic algorithm car evolution simulation game. Evolve increasingly sophisticated cars to travel maximum distances across procedurally generated terrain. Features physics-based simulation with Planck.js, genetic algorithms for evolution, and an interactive UI for building and unlocking car parts.

**Tech Stack:**
- Language: JavaScript (ES Modules)
- Build Tool: Vite
- Physics Engine: Planck.js (2D physics simulation)
- Rendering: HTML5 Canvas (2D)
- Image Processing: Jimp (for asset processing)
- Testing: Vitest (unit tests), Playwright (E2E tests)
- Linter: ESLint

## Development Approach

**Testing Philosophy:**
- Comprehensive unit test coverage with Vitest
- E2E tests with Playwright for UI and game flow
- Test-driven development encouraged
- Tests co-located with source files (*.test.js)

**Testing Commands:**
```bash
npm run test         # Run unit tests
npm run test:watch   # Watch mode for unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:all     # Run all tests
```

**Code Style:**
- Linter: ESLint with .eslintrc.cjs
- Style enforcement across /src
- Auto-fix available with `npm run lint:fix`

**Running:**
```bash
npm run dev      # Start development server with Vite
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run linter
```

## Architecture

**Project Structure:**
```
config/                  # JSON configuration files
├── game.json           # Core game settings (population, DNA, simulation)
├── economy.json        # Money, rewards, milestones
├── parts.json          # Car parts definitions and properties
└── evolution.json      # Genetic algorithm parameters
src/
├── main.js              # Entry point
├── gameConfig.js        # Config loader wrapper (loads from JSON)
├── partRegistry.js      # Registry for car parts (loads from JSON)
├── utils/
│   └── configLoader.js  # JSON config loading utility
├── ga/                  # Genetic Algorithm module
│   ├── dna.js          # DNA structure and random generation
│   ├── evolve.js       # Evolution logic (generations)
│   ├── mutate.js       # Mutation operations
│   └── select.js       # Selection (fitness-based)
├── physics/            # Physics simulation
│   ├── buildCar.js     # Build Planck bodies from DNA
│   ├── jetpack.js      # Jetpack energy system
│   ├── simulate.js     # Physics step and car updates
│   └── track.js        # Track generation
├── render/             # Rendering engine
│   ├── renderWorld.js  # Canvas rendering
│   └── assetDimensions.json # Asset metadata
└── ui/                 # User interface
    ├── app.js          # Main app controller
    ├── partsPanel.js   # Part selection UI
    ├── controls.js     # Game controls
    └── layout.js       # UI layout
```

**Core Modules:**
- `src/ga/`: Genetic algorithm for evolving cars (DNA, mutations, selection)
- `src/physics/`: Physics simulation using Planck.js (car building, jetpack, track)
- `src/render/`: 2D Canvas rendering of the simulation world
- `src/ui/`: Interactive UI for game controls and car building

**Design Patterns:**
- Class-based App controller (src/ui/app.js) manages overall simulation state
- Functional modules for GA operations (evolve, mutate, select)
- Configuration-driven: All game settings stored in JSON files under `/config`
- Config loader utility (`src/utils/configLoader.js`) handles both browser and Node.js environments

## Configuration System

**Overview:**
All game configuration is stored in JSON files under the `/config` directory. This allows easy modification of game balance, parts, economy, and genetic algorithm parameters without touching source code.

**Configuration Files:**

1. **`config/game.json`** - Core game settings
   - Population size (default: 60)
   - DNA constraints (max parts: 12, max wheels: 4)
   - Simulation parameters (time step, progress timeout)
   - Car spawning settings (cars per frame, culling distance)
   - Control settings (stop wait, drag factor)

2. **`config/economy.json`** - Economy settings
   - Starting money: 200
   - Money per milestone: 30
   - Milestone distance: 30 meters

3. **`config/parts.json`** - Car parts definitions
   - Part types: block, wheel, big_wheel, small_wheel, tiny_wheel, long_body, jetpack
   - Properties: dimensions, density, friction, motor multipliers
   - Visual properties: colors (fill, stroke, accent), sprites
   - Pricing and unlock status

4. **`config/evolution.json`** - Genetic algorithm parameters
   - Elite count: 6
   - Crossover rate: 0.9
   - DNA generation rules (probabilities, ranges)
   - Mutation parameters (deltas, min/max values for all properties)

**Config Loader:**
- Location: `src/utils/configLoader.js`
- Supports both browser (fetch) and Node.js (fs) environments
- Caches loaded configs for performance
- Functions: `loadConfig()`, `getGameConfig()`, `getEconomyConfig()`, `getPartsConfig()`, `getEvolutionConfig()`

**Modifying Game Balance:**
To adjust game parameters, edit the relevant JSON file in `/config`. Changes take effect after restarting the dev server. Examples:
- Increase population: edit `config/game.json` → `population.default`
- Adjust part prices: edit `config/parts.json` → `parts[].price`
- Change mutation rates: edit `config/evolution.json` → `mutation.partProperties`

## Game Systems

**Genetic Algorithm:**
- DNA: Array of parts and joints forming a tree structure
- Root part (body) connects to children (wheels, jetpacks, extra blocks)
- Mutation: Part properties (w, h, density, friction), add/remove parts, modify joints
- Selection: Fitness = distance traveled; fittest survive to next generation
- Economy: Money earned per milestone; unlock new car parts

**Physics System:**
- Built on Planck.js (2D rigid body physics)
- Cars: Tree-structured bodies connected by constraints (weld, revolute joints)
- Wheels: Revolute joints with motor for torque application
- Jetpack: Energy-based thrust system (recharges on track contact)
- Collision: Cars interact with track and each other

**Jetpack System:**
- Energy mechanic: max 100 energy, consumption 50/sec while thrusting
- Recharge: 80 energy/sec when in contact with track
- Boost interval: 4.0 seconds between boosts, 1.0 second duration per boost
- Thrust: 200 force units when active
- All parameters configurable in `config/parts.json` (jetpack entry)

**Economy System:**
- Starting money: 200
- Money per milestone (30 meters): 30 currency
- Parts have prices; unlocked parts available for evolution
- All parameters configurable in `config/economy.json`

## Conventions

**Naming:**
- Files: kebab-case for modules, camelCase for functions/methods
- Classes: PascalCase (e.g., App)
- Functions: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

**Git Workflow:**
- Branch naming: Feature branches start with `claude/` followed by session ID
- Commit messages: Descriptive, action-oriented (e.g., "Implement jetpack energy system", "Add air friction")
- PR workflow: Include test results and describe changes

**Code Organization:**
- Tests co-located with source: `feature.js` and `feature.test.js` in same directory
- Import structure: planck first, then local modules
- Planck.js units: Meters (1 unit = 1 meter in simulation)
- Canvas scale: 20 pixels per meter

## Environment Setup

**Required Tools:**
- Node.js 16+ (tested with recent LTS)
- npm

**Setup Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run test         # Run tests
```

**Key Dependencies:**
- planck-js: 2D physics engine
- jimp: Image processing for assets
- @playwright/test: E2E testing
- vite: Build tool
- vitest: Unit testing

## Known Constraints & Gotchas

- **Planck.js Physics:** Uses meters internally; canvas renders at 20px/meter scale
- **Collisions:** Car parts use collision categories/masks for ground vs car interactions
- **Car Culling:** Cars culled 250m behind the champion to optimize performance; re-added if they catch up
- **Staggered Spawning:** 10 cars created per frame to prevent frame rate drops on new generations
- **Jetpack Recharge:** Only recharges when wheels touch track; mid-air provides no recharge

## Recent Major Changes

- [2026-01-14] **Configuration refactoring**: All game settings moved to JSON files
  - Created `/config` directory with 4 JSON configuration files
  - Core settings: game.json (population, DNA, simulation)
  - Economy: economy.json (money, milestones)
  - Parts: parts.json (all car parts with properties and visuals)
  - Evolution: evolution.json (GA parameters, mutation rules)
  - Config loader utility supports both browser and Node.js environments
  - All 87 unit tests passing after refactoring
- [2025-01-14] Jetpack energy system with track recharge implemented
- [2025-01-14] Air friction added for faster descents when flying
- [2025-01-14] Game balance adjustments: periodic jetpack, longer charge bar, wheel size adjustments
- [2025-01-14] All car parts unlocked from start; population set to 60

---
*Last updated: 2026-01-14 - Configuration system refactored to JSON files*
