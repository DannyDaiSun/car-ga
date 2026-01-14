
import { pickParentRoulette } from './select.js';
import { subtreeCrossover, mutatePerField, normalizeAndClamp } from './mutate.js';
import { cloneDNA, createRandomDNA } from './dna.js';
import { getEvolutionConfig } from '../utils/configLoader.js';

// Load evolution configuration
const evolutionConfig = await getEvolutionConfig();
const ELITE_COUNT = evolutionConfig.eliteCount;
const CROSSOVER_RATE = evolutionConfig.crossoverRate;

export function createFirstGeneration(popSize = 100, maxParts = 8, unlockedParts) {
    const pop = [];
    for (let i = 0; i < popSize; i++) {
        pop.push(createRandomDNA(maxParts, unlockedParts));
    }
    return pop;
}

export function nextGeneration(prevPop, { popSize = 100, mutRate = 0.02, maxParts = 8, unlockedParts } = {}) {
    // prevPop is array of { dna, fitness }

    // 1. Sort by fitness desc
    const sorted = [...prevPop].sort((a, b) => b.fitness - a.fitness);

    // 2. Elitism
    const nextDNAs = [];
    for (let i = 0; i < ELITE_COUNT; i++) {
        if (sorted[i]) {
            nextDNAs.push(cloneDNA(sorted[i].dna));
        } else {
            // Fallback if small pop
            nextDNAs.push(createRandomDNA(maxParts, unlockedParts));
        }
    }

    // 3. Breeding
    const dnas = prevPop.map(p => p.dna);
    const fitnesses = prevPop.map(p => p.fitness);

    while (nextDNAs.length < popSize) {
        const p1 = pickParentRoulette(dnas, fitnesses);
        const p2 = pickParentRoulette(dnas, fitnesses);

        let child;
        if (Math.random() < CROSSOVER_RATE) {
            child = subtreeCrossover(p1, p2);
        } else {
            child = cloneDNA(p1);
        }

        child = mutatePerField(child, mutRate);
        child = normalizeAndClamp(child);

        nextDNAs.push(child);
    }

    return nextDNAs;
}
