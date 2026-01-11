import { describe, it, expect } from 'vitest';
import { getTrackHeight } from './track.js';

describe('track.js', () => {
    // B-17: Given x < 0, When getTrackHeight(x) is called, Then it returns 4 (wall height)
    it('getTrackHeight returns 4 for x < 0', () => {
        expect(getTrackHeight(-5)).toBe(4);
    });

    // B-18: Given 0 ≤ x < 10, When getTrackHeight(x) is called, Then it returns 0 (flat start)
    it('getTrackHeight returns 0 for flat start zone', () => {
        expect(getTrackHeight(5)).toBe(0);
    });

    // B-19: Given x ≥ 10, When getTrackHeight(x) is called, Then it returns a deterministic value based on sine waves
    it('getTrackHeight returns deterministic value for x >= 10', () => {
        const height1 = getTrackHeight(50);
        const height2 = getTrackHeight(50);
        expect(height1).toBe(height2);
    });
});
