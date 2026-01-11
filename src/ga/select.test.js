import { describe, it, expect } from 'vitest';
import { pickParentRoulette } from './select.js';
import { createRandomDNA } from './dna.js';

describe('select.js', () => {
    // B-7: Given a population with all zero fitness, When pickParentRoulette() is called, Then it returns a cloned DNA (not same reference)
    it('pickParentRoulette returns cloned DNA with zero fitness population', () => {
        const pop = [createRandomDNA(), createRandomDNA()];
        const fitnesses = [0, 0];
        const result = pickParentRoulette(pop, fitnesses);
        expect(result).not.toBe(pop[0]);
    });

    // B-8: Given a population with positive fitnesses, When pickParentRoulette() is called, Then it returns a valid DNA object
    it('pickParentRoulette returns valid DNA with positive fitnesses', () => {
        const pop = [createRandomDNA(), createRandomDNA()];
        const fitnesses = [10, 20];
        const result = pickParentRoulette(pop, fitnesses);
        expect(result.parts).toBeDefined();
    });
});
