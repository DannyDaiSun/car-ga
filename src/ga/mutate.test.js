import { describe, it, expect } from 'vitest';
import { mutatePerField, subtreeCrossover, normalizeAndClamp } from './mutate.js';
import { createRandomDNA, cloneDNA } from './dna.js';

describe('mutate.js', () => {
    // B-9: Given a DNA with rate=0, When mutatePerField() is called, Then numeric fields remain unchanged
    it('mutatePerField with rate=0 preserves original values', () => {
        const original = createRandomDNA(3);
        const clone = cloneDNA(original);
        const mutated = mutatePerField(clone, 0);
        expect(mutated.parts[0].w).toBe(original.parts[0].w);
    });

    // B-10: Given two parent DNAs, When subtreeCrossover() is called, Then it returns a new DNA object
    it('subtreeCrossover returns a new DNA object', () => {
        const p1 = createRandomDNA(4);
        const p2 = createRandomDNA(4);
        const child = subtreeCrossover(p1, p2);
        expect(child).not.toBe(p1);
    });

    // B-11: Given a DNA with >12 parts, When normalizeAndClamp() is called, Then parts count is ≤12
    it('normalizeAndClamp limits parts to 12', () => {
        // Create DNA with many parts manually
        const dna = createRandomDNA(12);
        // Add extra parts to exceed limit
        for (let i = dna.parts.length; i < 15; i++) {
            dna.parts.push({ id: i, kind: 'block', w: 0.5, h: 0.5, density: 1, friction: 0.5 });
            dna.joints.push({ childId: i, parentId: 0, anchorX: 0, anchorY: 0, jointType: 'revolute', enableLimit: false, lowerAngle: 0, upperAngle: 0, breakForce: 1000, breakTorque: 500 });
        }
        const normalized = normalizeAndClamp(dna);
        expect(normalized.parts.length).toBeLessThanOrEqual(12);
    });

    // B-12: Given a DNA with >4 wheels, When normalizeAndClamp() is called, Then wheel count is ≤4
    it('normalizeAndClamp limits wheels to 4', () => {
        const dna = { parts: [{ id: 0, kind: 'block', w: 1, h: 1, density: 1, friction: 0.5 }], joints: [] };
        // Add 6 wheels
        for (let i = 1; i <= 6; i++) {
            dna.parts.push({ id: i, kind: 'wheel', radius: 0.5, density: 1, friction: 0.5, motorSpeed: 10, maxMotorTorque: 50 });
            dna.joints.push({ childId: i, parentId: 0, anchorX: 0, anchorY: 0, jointType: 'revolute', enableLimit: false, lowerAngle: 0, upperAngle: 0, breakForce: 1000, breakTorque: 500 });
        }
        const normalized = normalizeAndClamp(dna);
        const wheelCount = normalized.parts.filter(p => p.kind === 'wheel').length;
        expect(wheelCount).toBeLessThanOrEqual(4);
    });

    // B-13: Given a DNA with non-contiguous IDs, When normalizeAndClamp() is called, Then IDs are renumbered 0..N-1
    it('normalizeAndClamp renumbers IDs to be contiguous', () => {
        const dna = {
            parts: [
                { id: 0, kind: 'block', w: 1, h: 1, density: 1, friction: 0.5 },
                { id: 5, kind: 'block', w: 0.5, h: 0.5, density: 1, friction: 0.5 },
                { id: 10, kind: 'wheel', radius: 0.5, density: 1, friction: 0.5, motorSpeed: 10, maxMotorTorque: 50 }
            ],
            joints: [
                { childId: 5, parentId: 0, anchorX: 0, anchorY: 0, jointType: 'revolute', enableLimit: false, lowerAngle: 0, upperAngle: 0, breakForce: 1000, breakTorque: 500 },
                { childId: 10, parentId: 5, anchorX: 0, anchorY: 0, jointType: 'revolute', enableLimit: false, lowerAngle: 0, upperAngle: 0, breakForce: 1000, breakTorque: 500 }
            ]
        };
        const normalized = normalizeAndClamp(dna);
        const ids = normalized.parts.map(p => p.id);
        expect(ids).toEqual([0, 1, 2]);
    });
});
