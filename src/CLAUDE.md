# Module Memory - Source Code (src/)

> This file provides an overview of the src/ directory structure and core systems.

## Directory Overview

```
src/
├── CLAUDE.md             # This file
├── main.js               # Application entry point
├── gameConfig.js         # Game configuration (part definitions, economy)
├── partRegistry.js       # Part registry and metadata
├── ga/                   # Genetic Algorithm module
│   ├── CLAUDE.md        # GA system documentation
│   ├── dna.js           # DNA representation and generation
│   ├── evolve.js        # Generation evolution
│   ├── mutate.js        # Mutation operations
│   └── select.js        # Fitness-based selection
├── physics/             # Physics Simulation module
│   ├── CLAUDE.md        # Physics system documentation
│   ├── buildCar.js      # Convert DNA to Planck bodies
│   ├── jetpack.js       # Jetpack energy system
│   ├── simulate.js      # Physics step and updates
│   └── track.js         # Track terrain generation
├── render/              # Rendering module
│   ├── CLAUDE.md        # Rendering system documentation
│   ├── renderWorld.js   # Canvas rendering
│   └── assetDimensions.json # Asset metadata
└── ui/                  # User Interface module
    ├── CLAUDE.md        # UI system documentation
    ├── app.js           # Main app controller
    ├── partsPanel.js    # Parts purchasing UI
    ├── controls.js      # Input handling
    └── layout.js        # UI layout utilities
```

## Core Configuration Files

**gameConfig.js:**
- `PART_DEFINITIONS`: All car part types, prices, properties
- `ECONOMY`: Starting money, milestone values

**partRegistry.js:**
- Part metadata and helper functions
- Part unlocking logic
- Price and property lookups

## System Integration

**Data Flow:**
```
gameConfig.js (configuration)
    ↓
UI: app.js (state, controls)
    ↓
GA: evolve/mutate (create DNA)
    ↓
Physics: buildCar (DNA → bodies)
    ↓
Physics: simulate (step world)
    ↓
Render: renderWorld (draw to canvas)
```

**Key Classes/Functions:**
- `App` (ui/app.js): Main controller
- `buildCar()` (physics/buildCar.js): DNA to Planck bodies
- `simulate()`/`simulateStep()` (physics/simulate.js): Physics loop
- `nextGeneration()` (ga/evolve.js): GA evolution
- `render()` (render/renderWorld.js): Canvas rendering

## Module Dependencies

- **ui/app.js** depends on: ga/*, physics/*, render/*
- **physics/buildCar.js** depends on: gameConfig.js, planck-js
- **physics/simulate.js** depends on: physics/jetpack.js, track.js
- **ga/dna.js** depends on: gameConfig.js
- **ga/mutate.js** depends on: gameConfig.js, dna.js
- **render/renderWorld.js** depends on: none (pure canvas)

## Code Style

**Conventions:**
- Modules are ES6 (import/export)
- Functions are pure where possible
- Tests are co-located: `feature.js` + `feature.test.js`
- Constants are UPPER_SNAKE_CASE
- Functions/methods are camelCase

## Testing

All tests use Vitest and are located alongside source:
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
```

Tests are organized by module directory.

## Key Entry Points

1. **main.js**: Application entry point (sets up canvas, App instance, starts loop)
2. **ui/app.js**: Main App class (orchestrates everything)
3. **gameConfig.js**: Configuration that drives evolution and economy

---
*Last updated: 2025-01-14 - Source code structure and integration overview*
