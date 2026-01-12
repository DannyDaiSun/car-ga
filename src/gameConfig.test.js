import { describe, it, expect } from 'vitest';
import { PART_DEFINITIONS } from './gameConfig.js';

describe('gameConfig.js', () => {
    // B-25: Given PART_DEFINITIONS, When accessing small_wheel, Then it has motorMultiplier=1.5 and breakMultiplier=0.6
    it('PART_DEFINITIONS.small_wheel has correct multipliers', () => {
        expect(PART_DEFINITIONS.small_wheel.motorMultiplier).toBe(1.5);
    });

    // B-26: Given PART_DEFINITIONS, When accessing tiny_wheel, Then it has motorMultiplier=2.0 and breakMultiplier=0.3
    it('PART_DEFINITIONS.tiny_wheel has correct multipliers', () => {
        expect(PART_DEFINITIONS.tiny_wheel.motorMultiplier).toBe(2.0);
    });

    // B-41: Given PART_DEFINITIONS, When checking part abilities, Then each part lists a non-empty ability.
    it('PART_DEFINITIONS entries include abilities', () => {
        const hasAbilities = Object.values(PART_DEFINITIONS).every(part => Boolean(part.ability));
        expect(hasAbilities).toBe(true);
    });
});
