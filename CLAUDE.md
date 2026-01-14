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
src/
├── main.js              # Entry point
├── gameConfig.js        # Game configuration (parts, economy)
├── partRegistry.js      # Registry for car parts
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
- Configuration-driven: gameConfig.js for all part definitions and economy

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

**Jetpack System (as of 2025-01-14):**
- Energy mechanic: max 100 energy, consumption 50/sec while thrusting
- Recharge: 80 energy/sec when in contact with track
- Boost interval: 3.0 seconds between boosts, 0.3 second duration per boost
- Thrust: 200 force units when active

**Economy System:**
- Starting money: 200
- Money per milestone (30 meters): 30 currency
- Parts have prices; unlocked parts available for evolution

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

- [2025-01-14] Jetpack energy system with track recharge implemented
- [2025-01-14] Air friction added for faster descents when flying
- [2025-01-14] Game balance adjustments: periodic jetpack, longer charge bar, wheel size adjustments
- [2025-01-14] All car parts unlocked from start; population set to 60
- [2025-01-14] Previous: Jetpack periodic boost system, physics improvements

---
*Last updated: 2025-01-14 - Initial project memory sweep with jetpack and physics systems documented*
