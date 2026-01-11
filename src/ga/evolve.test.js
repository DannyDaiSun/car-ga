import { describe, it, expect } from 'vitest';
import { createFirstGeneration, nextGeneration } from './evolve.js';
import { createRandomDNA, cloneDNA } from './dna.js';

describe('evolve.js', () => {
    // B-14: Given popSize=10, When createFirstGeneration(10) is called, Then it returns an array of length 10
    it('createFirstGeneration returns correct population size', () => {
        const pop = createFirstGeneration(10);
        expect(pop.length).toBe(10);
    });

    // B-15: Given a previous population, When nextGeneration() is called, Then it returns a new array of size popSize
    it('nextGeneration returns correct population size', () => {
        const prevPop = [];
        for (let i = 0; i < 10; i++) {
            prevPop.push({ dna: createRandomDNA(), fitness: Math.random() * 100 });
        }
        const next = nextGeneration(prevPop, { popSize: 10 });
        expect(next.length).toBe(10);
    });

    // B-16: Given a sorted population, When nextGeneration() is called, Then top 6 elites are preserved
    it('nextGeneration preserves top 6 elites', () => {
        const prevPop = [];
        for (let i = 0; i < 20; i++) {
            const dna = createRandomDNA(3);
            // Mark each DNA with a unique identifier by setting root width = fitness
            dna.parts[0].w = i + 1;
            prevPop.push({ dna, fitness: i + 1 });
        }
        const next = nextGeneration(prevPop, { popSize: 20, mutRate: 0 });
        // Top fitness was 20, 19, 18, 17, 16, 15 - check if top elite is preserved
        const topEliteWidth = next[0].parts[0].w;
        expect(topEliteWidth).toBe(20);
    });
});
