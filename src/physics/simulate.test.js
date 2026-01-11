import { describe, it, expect } from 'vitest';
import { Simulation } from './simulate.js';
import { createRandomDNA } from '../ga/dna.js';

describe('simulate.js', () => {
    // B-20: Given a valid DNA, When new Simulation(dna) is created, Then finished is initially false
    it('Simulation starts with finished=false', () => {
        const dna = createRandomDNA(4);
        const sim = new Simulation(dna);
        expect(sim.finished).toBe(false);
    });

    // B-21: Given a simulation, When getFitness() is called, Then it returns a non-negative number
    it('getFitness returns non-negative number', () => {
        const dna = createRandomDNA(4);
        const sim = new Simulation(dna);
        expect(sim.getFitness()).toBeGreaterThanOrEqual(0);
    });
});
