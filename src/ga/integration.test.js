
import { describe, it, expect, vi } from 'vitest';
import { App } from '../ui/app.js';
import * as planck from 'planck-js';

// Mock render to avoid canvas dependency
vi.mock('../render/renderWorld.js', () => ({
    render: vi.fn()
}));

global.requestAnimationFrame = vi.fn();


describe('Game Loop Integration', () => {
    it('successfully evolves to next generation when cars finish', () => {
        const mockCanvas = {
            getContext: () => ({
                fillStyle: '',
                font: '',
                fillText: vi.fn(),
            }),
            width: 800,
            height: 600,
            parentElement: { clientWidth: 800, clientHeight: 600 }
        };

        const app = new App(mockCanvas);
        app.start(); // This initializes population and physics world

        // Force all cars to be finished
        app.cars.forEach(c => c.finished = true);

        // Run one loop step
        // This should trigger evolve() -> startGeneration()
        expect(() => {
            // We can't call app.loop() directly because it uses requestAnimationFrame which might not work well in test env without timers.
            // But checking the logic:
            if (app.isGenerationFinished()) {
                app.evolve();
            }
        }).not.toThrow();

        expect(app.generation).toBe(2);
        expect(app.cars.length).toBeGreaterThan(0);
        // Ensure new cars are not finished
        expect(app.cars.every(c => !c.finished)).toBe(true);
    });

    it('finishes stopped cars quickly (0.5s) instead of waiting full timeout', () => {
        const mockCanvas = {
            getContext: () => ({
                fillStyle: '',
                font: '',
                fillText: vi.fn(),
            }),
            width: 800,
            height: 600,
            parentElement: { clientWidth: 800, clientHeight: 600 }
        };

        const app = new App(mockCanvas);
        // Do not call app.start() to avoid real physics creation
        app.running = true;

        // Mock car
        const mockChassis = {
            getLinearVelocity: () => ({ length: () => 0.05 }), // Low velocity < 0.1
            getPosition: () => ({ x: 0, y: 0 })
        };
        const mockCar = {
            chassis: mockChassis,
            lastProgressTime: 0,
            maxX: 0,
            finished: false,
            parts: [], // empty
            joints: [],
            dna: {},
            fitness: 0
        };

        app.cars = [mockCar];
        app.time = 0.6; // > 0.5s timeout step

        // Mock world
        app.world = {
            step: vi.fn(),
            destroyJoint: vi.fn()
        };

        // Act
        app.stepSimulation();

        // Assert
        expect(mockCar.finished).toBe(true);
    });
});
