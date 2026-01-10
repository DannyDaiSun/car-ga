
import { cloneDNA } from './dna.js';

export function pickParentRoulette(pop, fitnesses) {
    // 1. Calculate Weights
    const weights = fitnesses.map(f => Math.max(0, f));
    const sumW = weights.reduce((a, b) => a + b, 0);

    // 2. Selection
    if (sumW === 0) {
        // Uniform
        const idx = Math.floor(Math.random() * pop.length);
        return cloneDNA(pop[idx]);
    }

    let r = Math.random() * sumW;
    let cum = 0;

    for (let i = 0; i < pop.length; i++) {
        cum += weights[i];
        if (cum >= r) {
            return cloneDNA(pop[i]);
        }
    }

    // Fallback (rounding errors)
    return cloneDNA(pop[pop.length - 1]);
}
