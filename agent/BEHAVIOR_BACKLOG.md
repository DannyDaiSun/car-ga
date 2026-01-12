# Behavior Backlog

Run all tests: `npm run test`

## Conflict-minimized updates

To reduce merge conflicts, new behaviors are recorded as individual files under
`agent/behaviors/` (see `agent/behaviors/README.md`). This table is legacy-only
and should not receive new rows.

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
| B-25 | PART_DEFINITIONS.small_wheel has motorMultiplier=1.5 and breakMultiplier=0.6 | ✅ | src/gameConfig.test.js |
| B-26 | PART_DEFINITIONS.tiny_wheel has motorMultiplier=2.0 and breakMultiplier=0.3 | ✅ | src/gameConfig.test.js |
| B-27 | createRandomDNA can generate small_wheel when unlocked | ✅ | src/ga/dna.test.js |
| B-28 | createRandomDNA can generate tiny_wheel when unlocked | ✅ | src/ga/dna.test.js |
| B-29 | README lists GitHub Actions workflow badges | ✅ | src/readme.test.js |
| B-30 | Unit tests exclude e2e specs via Vitest config | ✅ | src/vitest-config.test.js |
| B-31 | Pause stops scheduling new frames during the loop | ✅ | src/ui/app.test.js |
| B-32 | Best fitness stat reflects top distance across all cars | ✅ | src/ui/app.test.js |
| B-33 | Sidebar text uses high-contrast pixel dark color | ✅ | src/style.test.js |
| B-34 | Mobile sidebar stays in layout without overlapping the canvas | ✅ | src/style.test.js |
| B-35 | High speed simulation caps steps per frame | ✅ | src/ui/app.test.js |
| B-31 | GitHub Pages deploys site on push to main | ✅ | src/pages-workflow.test.js |
| B-36 | Mobile layout detection returns portrait mode for mobile user agents | ✅ | src/ui/layout.test.js |
| B-37 | Mobile layout detection returns landscape mode when viewport is wide | ✅ | src/ui/layout.test.js |
| B-38 | createRandomDNA scales standard wheel motor speed with the wheel multiplier | ✅ | src/ga/dna.test.js |
