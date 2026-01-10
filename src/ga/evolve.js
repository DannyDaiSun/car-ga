
import { pickParentRoulette } from './select.js';
import { subtreeCrossover, mutatePerField, normalizeAndClamp } from './mutate.js';
import { cloneDNA, createRandomDNA } from './dna.js';

const POP_SIZE = 60;
const ELITE_COUNT = 6;
const CROSSOVER_RATE = 0.90;
const MUT_RATE = 0.02;

export function createFirstGeneration() {
    const pop = [];
    for (let i = 0; i < POP_SIZE; i++) {
        pop.push(createRandomDNA());
    }
    return pop;
}

export function nextGeneration(prevPop) {
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
            nextDNAs.push(createRandomDNA());
        }
    }

    // 3. Breeding
    // We need logic to pick parents.
    // pickParentRoulette expects (popDNAs, fitnesses)
    // Actually we implemented pickParentRoulette(popDNAs, fitnesses) or similar?
    // Let's check select.js: pickParentRoulette(pop, fitnesses) returns DNA.
    // 'pop' argument is array of DNAs.

    const dnas = prevPop.map(p => p.dna);
    const fitnesses = prevPop.map(p => p.fitness);

    while (nextDNAs.length < POP_SIZE) {
        const p1 = pickParentRoulette(dnas, fitnesses);
        const p2 = pickParentRoulette(dnas, fitnesses);

        let child;
        if (Math.random() < CROSSOVER_RATE) {
            child = subtreeCrossover(p1, p2);
        } else {
            child = cloneDNA(p1);
        }

        child = mutatePerField(child, MUT_RATE);
        child = normalizeAndClamp(child);

        nextDNAs.push(child);
    }

    return nextDNAs;
}
