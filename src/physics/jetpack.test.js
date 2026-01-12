import { describe, it, expect } from 'vitest';
import { PART_DEFINITIONS } from '../gameConfig.js';
import { isJetpackBoostActive } from './jetpack.js';

describe('jetpack boost schedule', () => {
    // B-42: Given a jetpack boost schedule, When time is outside the boost window, Then the jetpack is inactive.
    it('returns false outside the boost window', () => {
        const active = isJetpackBoostActive(1.0, PART_DEFINITIONS.jetpack);
        expect(active).toBe(false);
    });
});
