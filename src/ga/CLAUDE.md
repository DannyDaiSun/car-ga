# Module Memory - Genetic Algorithm (src/ga/)

> This file contains module-specific knowledge about the GA evolution system.
> Update when mutation operations, DNA structure, or selection logic changes.

## Module Purpose

**What this module does:** Implements the genetic algorithm for evolving car designs. Manages DNA (genotypes), reproduction through crossover/mutation, and fitness-based selection.

**Key responsibilities:**
- DNA representation and random generation
- Mutation operations (modify parts, add/remove parts, joint parameters)
- Evolution across generations (selection, reproduction)
- Fitness evaluation and selection criteria

## Structure

```
src/ga/
├── dna.js              # DNA data structure, creation, copying
├── dna.test.js         # DNA tests
├── evolve.js           # Generation evolution logic
├── evolve.test.js      # Evolution tests
├── mutate.js           # Mutation operations
├── mutate.test.js      # Mutation tests
├── select.js           # Fitness-based selection
└── select.test.js      # Selection tests
```

**Key files:**
- `dna.js`: DNA structure (parts array, joints array), random generation helpers
- `evolve.js`: `createFirstGeneration()`, `nextGeneration()` - manages populations across generations
- `mutate.js`: All mutation operations - part mutations, add/remove parts, joint mutations
- `select.js`: `selectByFitness()` - selects best performers for reproduction

## DNA Structure

```javascript
// A car's DNA is an object:
{
  parts: [
    {
      id: 0,                    // Unique within DNA
      kind: 'block',            // Type: 'block', 'wheel', 'big_wheel', 'jetpack', etc.
      w: 1.2,                   // Width (meters)
      h: 0.8,                   // Height (meters)
      density: 2.5,             // Mass density (1-5 range typical)
      friction: 0.4,            // Friction coefficient (0.1-0.9)
      radius: 0.3               // For wheels (optional)
    }
    // ... more parts
  ],
  joints: [
    {
      parentId: 0,              // Parent part ID
      childId: 1,               // Child part ID
      jointType: 'weld',        // 'weld', 'revolute'
      relAngle: 0.5,            // Relative angle (radians)
      relDist: 1.5              // Relative distance (meters)
    }
    // ... more joints
  ]
}
```

**Part Rules:**
- Part 0 (id: 0) is always the root (main body)
- Max 12 parts per car (enforced during creation)
- Max 4 wheels per car (enforced during mutation)
- Joints form a tree structure (no cycles; parent must exist before child)

## Usage Patterns

**Common tasks:**

### Creating Random DNA
```javascript
import { createRandomDNA } from './dna.js';

const dna = createRandomDNA(maxParts=8, unlockedParts=new Set(['block', 'wheel']));
```

### Evolving to Next Generation
```javascript
import { nextGeneration } from './evolve.js';
import { selectByFitness } from './select.js';

// After simulation, cars have fitnesses set
const fitnesses = cars.map(c => c.distance); // or custom fitness metric

// Select survivors and breed
const nextPop = nextGeneration(population, fitnesses, mutationRate=0.05);
```

### Mutating a DNA
```javascript
import { mutate } from './mutate.js';

const mutated = mutate(dna, unlockedParts, mutationRate=0.05);
// Returns a new DNA object with random mutations applied
```

**Code patterns:**
- DNA objects are treated as immutable; mutations return new objects
- Random number generation uses utility function `randomRange(min, max)`
- Part kinds must exist in PART_DEFINITIONS from gameConfig.js
- Fitness = distance traveled; higher is better

## Dependencies

**Internal:**
- Depends on gameConfig.js for PART_DEFINITIONS

**External:**
- None (pure JS, no external GA libraries)

## Testing

**Test location:** `src/ga/*.test.js` (co-located with source)

**Running tests:**
```bash
npm run test -- src/ga
# or
npm run test:watch    # Watch all tests
```

**Test patterns:**
- Unit tests for each function (dna creation, mutations, selection)
- Integration tests (create DNA → mutate → validate structure)
- Fitness tests ensure selection favors higher distances
- Randomness validated with multiple samples

## API / Interface

**Public functions:**

**dna.js:**
- `createRandomDNA(maxParts=8, unlockedParts)`: Generate random car DNA
- `copyDNA(dna)`: Deep copy a DNA object
- `randomRange(min, max)`: Random number in range [min, max)
- `randomIntRange(min, max)`: Random integer in range [min, max]

**evolve.js:**
- `createFirstGeneration(popSize, maxParts, unlockedParts)`: Create initial population
- `nextGeneration(population, fitnesses, mutationRate)`: Evolve to next generation

**mutate.js:**
- `mutate(dna, unlockedParts, mutationRate)`: Apply random mutations to DNA
- `mutatePart(partDef)`: Mutate a single part's properties
- `mutateJoint(jointDef)`: Mutate a joint's properties
- `addRandomPart(dna, unlockedParts)`: Add a new part to DNA
- `removeRandomPart(dna)`: Remove a part (won't remove root)

**select.js:**
- `selectByFitness(population, fitnesses, count)`: Select top N performers

## Configuration

**Settings:**
- PART_DEFINITIONS in gameConfig.js controls available parts
- Mutation rate controlled by app (typically 0.05 = 5%)
- Max parts per car = 12
- Max wheels per car = 4

**Defaults:**
- Initial DNA: 1 root block + 1-3 random parts
- Wheel probability: 40% when adding random part
- Part constraints enforced during all operations

## Domain Logic

**Genetic Algorithm Approach:**
- **Population-based evolution**: Track entire generation, not individual lineages
- **Fitness-proportionate selection**: Fittest individuals more likely to be selected
- **Mutation-only reproduction**: No crossover/sexual reproduction; mutations create diversity
- **Elitism option**: Best performers always carry forward (implementation varies)

**Mutation Strategy:**
- **Part mutations**: Adjust w, h, density, friction on existing parts
- **Structural mutations**: Add or remove parts; modify joint angles/distances
- **Unlock-aware**: Only generate parts that are currently unlocked (economy system)
- **Constraint satisfaction**: Enforces part counts, tree structure after each mutation

**Selection Pressure:**
- Distance traveled is the primary fitness metric
- Survivors are selected probabilistically based on relative fitness
- Population size remains constant across generations

## Known Issues & Workarounds

- **Mutation rate tuning**: Too high = chaos, too low = slow evolution. 5% is baseline; adjust per testing.
- **Part ID tracking**: After adding/removing parts, IDs remain stable. Only the ID sequence matters for tree structure.
- **Locked parts in random DNA**: If all parts are locked, defaults to 'block' and 'wheel'

## Recent Changes

- [2025-01-14] All parts unlocked from game start (jetpack, big_wheel, small_wheel, tiny_wheel, long_body)
- [2025-01-14] Mutation operations support jetpack-specific properties
- [2025-01-08] Population size and max parts configurable via App constructor
- Previous: Initial GA system with DNA, mutation, and selection

---
*Last updated: 2025-01-14 - Documented DNA structure, mutation operations, and unlocked parts system*
