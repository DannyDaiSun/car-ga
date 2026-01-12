# Agent Instructions for car-ga

This document provides guidance for AI coding agents working on this project.

## Project Overview

**car-ga** is a genetic algorithm car evolution simulation game built with:
- **Vite** - Build tool and dev server
- **Planck.js** - 2D physics engine (Box2D port)
- **Vitest** - Testing framework
- **Vanilla JS** - No framework, ES modules

## Directory Structure

```
car-ga/
├── src/              # Source code
│   ├── ga/           # Genetic algorithm (DNA, mutation, crossover, selection)
│   ├── physics/      # Physics simulation (buildCar, simulate, track)
│   ├── ui/           # UI components (app, store, minimap)
│   └── *.js          # Core modules (gameConfig, etc.)
├── public/           # Static assets (images, fonts)
├── agent/            # TDD artifacts (BEHAVIOR_BACKLOG.md)
├── .agent/workflows/ # Workflow definitions
├── qa/               # QA testing artifacts
├── index.html        # Entry point
└── style.css         # Global styles
```

## Development Commands

```bash
# Start dev server
npm run dev

# Run all unit tests
npx vitest run

# Run tests in watch mode
npx vitest

# Build for production
npm run build
```

## Testing Guidelines

- Tests use **Vitest** framework
- Test files are co-located with source: `*.test.js`
- Follow TDD practices as defined in `.agent/workflows/`
- Each test should have exactly one assertion

## Code Style

- ES Modules (`import`/`export`)
- Descriptive function and variable names
- Keep functions small and focused
- Document complex physics or GA logic with comments

## Important Files

- `src/gameConfig.js` - Game configuration constants
- `src/ga/dna.js` - Car DNA encoding/decoding
- `src/physics/buildCar.js` - Creates physics bodies from DNA
- `src/ui/app.js` - Main UI controller

## Workflows

Check `.agent/workflows/` for defined procedures:
- `/new-feature` - Adding new functionality
- `/fix-bugs` - Bug fixing process
- `/quality-assurance` - QA testing
- `/commit` - Commit process
