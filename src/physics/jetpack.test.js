import { describe, it, expect } from 'vitest';
import { PART_DEFINITIONS } from '../gameConfig.js';
import { isJetpackBoostActive, updateJetpackEnergy, canJetpackThrust } from './jetpack.js';

describe('jetpack boost schedule', () => {
    // B-42: Given a jetpack boost schedule, When time is outside the boost window, Then the jetpack is inactive.
    it('returns false outside the boost window', () => {
        const active = isJetpackBoostActive(1.0, PART_DEFINITIONS.jetpack);
        expect(active).toBe(false);
    });
});

describe('jetpack energy system', () => {
    const jetpackDef = PART_DEFINITIONS.jetpack;

    it('initializes energy to maximum when undefined', () => {
        const energyState = {};
        const result = updateJetpackEnergy(energyState, jetpackDef, 1.0, false, 0.016);
        expect(result.energy).toBe(jetpackDef.maxEnergy);
    });

    it('consumes energy during thrust', () => {
        const energyState = { energy: 100 };
        const result = updateJetpackEnergy(energyState, jetpackDef, 0.15, false, 0.016);
        expect(result.energy).toBeLessThan(100);
        expect(result.energy).toBeGreaterThan(0);
    });

    it('does not consume energy outside boost window', () => {
        const energyState = { energy: 100 };
        const result = updateJetpackEnergy(energyState, jetpackDef, 1.0, false, 0.016);
        expect(result.energy).toBe(100);
    });

    it('recharges energy when in contact', () => {
        const energyState = { energy: 50 };
        // Use timeSeconds=2.0 (during cooldown period, not during boost)
        const result = updateJetpackEnergy(energyState, jetpackDef, 2.0, true, 0.016);
        expect(result.energy).toBeGreaterThan(50);
        expect(result.energy).toBeLessThanOrEqual(jetpackDef.maxEnergy);
    });

    it('does not exceed maximum energy', () => {
        const energyState = { energy: 100 };
        const result = updateJetpackEnergy(energyState, jetpackDef, 0.5, true, 1.0);
        expect(result.energy).toBeLessThanOrEqual(jetpackDef.maxEnergy);
    });

    it('energy cannot go below zero', () => {
        const energyState = { energy: 1 };
        const result = updateJetpackEnergy(energyState, jetpackDef, 0.15, false, 1.0);
        expect(result.energy).toBeGreaterThanOrEqual(0);
    });

    it('canJetpackThrust returns true with energy', () => {
        const energyState = { energy: 50 };
        expect(canJetpackThrust(energyState)).toBe(true);
    });

    it('canJetpackThrust returns false without energy', () => {
        const energyState = { energy: 0 };
        expect(canJetpackThrust(energyState)).toBe(false);
    });

    it('canJetpackThrust returns false with no energy state', () => {
        expect(canJetpackThrust(null)).toBe(false);
        expect(canJetpackThrust(undefined)).toBe(false);
    });
});
