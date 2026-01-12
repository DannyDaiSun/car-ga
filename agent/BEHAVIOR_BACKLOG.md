# Behavior Backlog

Run all tests: `npx vitest run`

| ID | Behavior | Status | Test File |
|---|---|---|---|
| B-1 | App reports statistics (generation, best fitness) during updates | ✅ | src/ui/app.test.js |
| B-2 | Stopped cars finish quickly (0.5s) instead of full STOP_WAIT timeout | ✅ | src/ga/integration.test.js |
| B-3 | createRandomDNA returns DNA with root part id=0 | ✅ | src/ga/dna.test.js |
| B-4 | validateDNA returns true for valid DNA | ✅ | src/ga/dna.test.js |
| B-5 | validateDNA returns false for empty parts | ✅ | src/ga/dna.test.js |
| B-6 | cloneDNA returns a deep copy | ✅ | src/ga/dna.test.js |
| B-7 | pickParentRoulette returns cloned DNA with zero fitness population | ✅ | src/ga/select.test.js |
| B-8 | pickParentRoulette returns valid DNA with positive fitnesses | ✅ | src/ga/select.test.js |
| B-9 | mutatePerField with rate=0 preserves original values | ✅ | src/ga/mutate.test.js |
| B-10 | subtreeCrossover returns a new DNA object | ✅ | src/ga/mutate.test.js |
| B-11 | normalizeAndClamp limits parts to 12 | ✅ | src/ga/mutate.test.js |
| B-12 | normalizeAndClamp limits wheels to 4 | ✅ | src/ga/mutate.test.js |
| B-13 | normalizeAndClamp renumbers IDs to be contiguous | ✅ | src/ga/mutate.test.js |
| B-14 | createFirstGeneration returns correct population size | ✅ | src/ga/evolve.test.js |
| B-15 | nextGeneration returns correct population size | ✅ | src/ga/evolve.test.js |
| B-16 | nextGeneration preserves top 6 elites | ✅ | src/ga/evolve.test.js |
| B-17 | getTrackHeight returns 4 for x < 0 | ✅ | src/physics/track.test.js |
| B-18 | getTrackHeight returns 0 for flat start zone | ✅ | src/physics/track.test.js |
| B-19 | getTrackHeight returns deterministic value for x >= 10 | ✅ | src/physics/track.test.js |
| B-20 | Simulation starts with finished=false | ✅ | src/physics/simulate.test.js |
| B-21 | getFitness returns non-negative number | ✅ | src/physics/simulate.test.js |
| B-22 | Successfully evolves to next generation when cars finish | ✅ | src/ga/integration.test.js |
| B-23 | Camera switches to next running car when shown car stops | ✅ | src/ui/app.test.js |
| B-24 | UI fonts remain pixelated after load | ✅ | Verified Manually (CSS) |
