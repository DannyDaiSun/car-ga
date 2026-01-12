
import { describe, it, expect, vi } from 'vitest';
import { App } from './app.js';
import { render } from '../render/renderWorld.js';
import { PART_DEFINITIONS } from '../gameConfig.js';

// Mock dependencies that might cause issues in Node environment
// renderWorld uses CanvasRenderingContext2D methods.
vi.mock('../render/renderWorld.js', () => ({
    render: vi.fn()
}));

// We might need to mock physics/track and physics/buildCar if they fail
vi.mock('../physics/track.js', () => ({
    createTrack: vi.fn()
}));
vi.mock('../physics/buildCar.js', () => ({
    buildCar: () => ({ parts: new Map(), joints: [] })
}));
vi.mock('../ga/evolve.js', () => ({
    createFirstGeneration: () => [],
    nextGeneration: () => []
}));

describe('App UI Behavior', () => {
    it('reports statistics during draw loop', () => {
        // Mock Canvas
        const mockCtx = {
            fillStyle: '',
            font: '',
            fillText: vi.fn(),
        };
        const mockCanvas = {
            getContext: () => mockCtx,
            width: 800,
            height: 600
        };

        const app = new App(mockCanvas);

        // Manually set state
        app.generation = 42;
        app.cars = [{
            maxX: 123.45,
            finished: false,
            // Mock other props needed for draw() logic if any
            chassis: { getPosition: () => ({ x: 0, y: 0 }) },
            carId: 0
        }];

        // Define verify behavior
        const statsListener = vi.fn();
        app.setStatsCallback(statsListener);

        // Act
        app.draw();

        // Assert
        expect(statsListener).toHaveBeenCalledWith({
            generation: 42,
            bestFitness: 123.45
        });
    });

    it('selects running car over stopped car with higher maxX', () => {
        const mockCtx = { fillStyle: '', font: '', fillText: vi.fn() };
        const mockCanvas = { getContext: () => mockCtx, width: 800, height: 600 };
        const app = new App(mockCanvas);

        app.cars = [
            { carId: 0, maxX: 100, finished: true, chassis: { getPosition: () => ({ x: 100, y: 0 }) } },
            { carId: 1, maxX: 50, finished: false, chassis: { getPosition: () => ({ x: 50, y: 0 }) } },
        ];

        app.draw();

        // The render function is called with the running car's leaderId
        expect(render).toHaveBeenLastCalledWith(
            expect.anything(),
            null, // world is null in test environment
            5, // cameraX = running car's position (smoothed)
            expect.anything(),
            expect.anything(),
            1, // leaderId = running car
            expect.anything()
        );
    });

    it('does not schedule another frame after pausing mid-loop', () => {
        const mockCtx = { fillStyle: '', font: '', fillText: vi.fn() };
        const mockCanvas = { getContext: () => mockCtx, width: 800, height: 600 };
        const app = new App(mockCanvas);
        const rafSpy = vi.fn();
        const originalRaf = global.requestAnimationFrame;

        app.running = true;
        app.isGenerationFinished = () => false;
        app.stepSimulation = vi.fn();
        app.draw = () => {
            app.running = false;
        };

        global.requestAnimationFrame = rafSpy;

        app.loop();

        global.requestAnimationFrame = originalRaf;

        expect(rafSpy).not.toHaveBeenCalled();
    });

    it('reports best fitness across all cars', () => {
        const mockCtx = { fillStyle: '', font: '', fillText: vi.fn() };
        const mockCanvas = { getContext: () => mockCtx, width: 800, height: 600 };
        const app = new App(mockCanvas);
        const statsListener = vi.fn();

        app.cars = [
            { maxX: 120, finished: true, chassis: { getPosition: () => ({ x: 0, y: 0 }) }, carId: 0 },
            { maxX: 60, finished: false, chassis: { getPosition: () => ({ x: 0, y: 0 }) }, carId: 1 }
        ];

        app.setStatsCallback(statsListener);
        app.draw();

        expect(statsListener).toHaveBeenCalledWith({
            generation: 1,
            bestFitness: 120
        });
    });

    it('caps simulation steps per frame at five', () => {
        const mockCtx = { fillStyle: '', font: '', fillText: vi.fn() };
        const mockCanvas = { getContext: () => mockCtx, width: 800, height: 600 };
        const app = new App(mockCanvas);
        const rafSpy = vi.fn();
        const originalRaf = global.requestAnimationFrame;

        app.running = true;
        app.speed = 10;
        app.isGenerationFinished = () => false;
        app.stepSimulation = vi.fn();
        app.draw = vi.fn();

        global.requestAnimationFrame = rafSpy;

        app.loop();

        global.requestAnimationFrame = originalRaf;

        expect(app.stepSimulation).toHaveBeenCalledTimes(5);
    });

    it('starts with enough money to buy at least two parts', () => {
        const mockCtx = { fillStyle: '', font: '', fillText: vi.fn() };
        const mockCanvas = { getContext: () => mockCtx, width: 800, height: 600 };
        const app = new App(mockCanvas);
        const prices = Object.values(PART_DEFINITIONS)
            .map(part => part.price)
            .filter(price => price > 0)
            .sort((a, b) => a - b);
        const minimumTwoPartTotal = prices[0] + prices[1];

        expect(app.money).toBeGreaterThanOrEqual(minimumTwoPartTotal);
    });
});
