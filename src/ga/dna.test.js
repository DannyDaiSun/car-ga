import { describe, it, expect } from 'vitest';
import { createRandomDNA, validateDNA, cloneDNA } from './dna.js';

describe('dna.js', () => {
    // B-3: Given no arguments, When createRandomDNA() is called, Then it returns a DNA with at least a root part (id=0)
    it('createRandomDNA returns DNA with root part id=0', () => {
        const dna = createRandomDNA();
        expect(dna.parts[0].id).toBe(0);
    });

    // B-4: Given a valid DNA, When validateDNA() is called, Then it returns true
    it('validateDNA returns true for valid DNA', () => {
        const dna = createRandomDNA();
        expect(validateDNA(dna)).toBe(true);
    });

    // B-5: Given an empty parts array, When validateDNA() is called, Then it returns false
    it('validateDNA returns false for empty parts', () => {
        const invalidDna = { parts: [], joints: [] };
        expect(validateDNA(invalidDna)).toBe(false);
    });

    // B-6: Given a DNA object, When cloneDNA() is called, Then the clone is a deep copy (not same reference)
    it('cloneDNA returns a deep copy', () => {
        const original = createRandomDNA();
        const clone = cloneDNA(original);
        expect(clone).not.toBe(original);
    });

    // B-27: Given small_wheel in unlocked parts, When createRandomDNA is called many times, Then at least one DNA contains a small_wheel part
    it('createRandomDNA can generate small_wheel when unlocked', () => {
        const unlocked = new Set(['block', 'wheel', 'small_wheel']);
        let found = false;
        for (let i = 0; i < 100 && !found; i++) {
            const dna = createRandomDNA(8, unlocked);
            found = dna.parts.some(p => p.kind === 'small_wheel');
        }
        expect(found).toBe(true);
    });

    // B-28: Given tiny_wheel in unlocked parts, When createRandomDNA is called many times, Then at least one DNA contains a tiny_wheel part
    it('createRandomDNA can generate tiny_wheel when unlocked', () => {
        const unlocked = new Set(['block', 'wheel', 'tiny_wheel']);
        let found = false;
        for (let i = 0; i < 100 && !found; i++) {
            const dna = createRandomDNA(8, unlocked);
            found = dna.parts.some(p => p.kind === 'tiny_wheel');
        }
        expect(found).toBe(true);
    });

    // B-38: Given a wheel part is generated, When createRandomDNA scales motor speed, Then wheel motorSpeed reflects the standard wheel multiplier
    it('createRandomDNA scales standard wheel motor speed with the wheel multiplier', () => {
        const originalRandom = Math.random;
        const sequence = [
            0.1, 0.1, 0.1, 0.1, // root part values
            0.1, // parent id
            0.1, // choose wheel
            0.75, // wheel base motorSpeed
            0.1, 0.1, 0.1, 0.1 // wheel radius, density, friction, torque
        ];
        let index = 0;
        Math.random = () => {
            if (index < sequence.length) {
                return sequence[index++];
            }
            return 0.1;
        };

        try {
            const dna = createRandomDNA(2, new Set(['block', 'wheel']));
            const wheel = dna.parts.find(part => part.kind === 'wheel');
            expect(wheel.motorSpeed).toBeCloseTo(13);
        } finally {
            Math.random = originalRandom;
        }
    });
});
