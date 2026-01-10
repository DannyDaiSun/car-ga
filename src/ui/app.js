
import * as planck from 'planck-js';
import { createTrack } from '../physics/track.js';
import { buildCar } from '../physics/buildCar.js';
import { createFirstGeneration, nextGeneration } from '../ga/evolve.js';
import { render } from '../render/renderWorld.js';

const POP_SIZE = 60;
const MAX_TIME = 20; // seconds
const STOP_WAIT = 3; // seconds
const MIN_PROGRESS = 0.05; // meters

export class App {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.generation = 1;
        this.population = createFirstGeneration(); // Array of DNA objects
        this.bestFitnessesByGen = [];

        this.running = false;
        this.speed = 1;

        // Simulation State
        this.world = null;
        this.cars = []; // Objects: { dna, chassis, parts, joints, maxX, lastProgressTime, finished, carId }
        this.time = 0;

        this.requestRef = null;
        this.statsCallback = null;
    }

    setStatsCallback(cb) {
        this.statsCallback = cb;
    }

    start() {
        this.startGeneration();
        this.running = true;
        this.loop();
    }

    startGeneration() {
        // Init Physics World
        this.world = planck.World({
            gravity: planck.Vec2(0, -9.8),
        });

        createTrack(this.world);

        // Build Cars
        this.cars = [];
        this.time = 0;

        this.population.forEach((dna, index) => {
            const startPos = planck.Vec2(0, 10); // Check QA-001: Increased from 4 to 10 to prevent clipping
            const { parts, joints } = buildCar(this.world, dna, startPos, index);

            // Tag bodies with carId (moved to buildCar)
            // parts.forEach(b => b.setUserData({ carId: index }));

            // Find chassis (root)
            const chassis = parts.get(0);

            this.cars.push({
                carId: index,
                dna: dna,
                parts: parts,
                joints: joints,
                chassis: chassis,
                maxX: -100,
                lastProgressTime: 0,
                finished: false,
                fitness: 0
            });
        });
    }

    loop() {
        if (!this.running) return;

        // Speed Multiplier
        // We step physics 'speed' times per frame?
        // Or just modify timestep? (Bad for stability).
        // Best: Multiple constant steps.
        const steps = Math.ceil(this.speed);

        for (let s = 0; s < steps; s++) {
            if (this.isGenerationFinished()) {
                this.evolve();
                break;
            }
            this.stepSimulation();
        }

        // Render
        this.draw();

        this.requestRef = requestAnimationFrame(() => this.loop());
    }

    stepSimulation() {
        const dt = 1 / 60;
        this.time += dt;

        // Step Physics
        this.world.step(dt);

        // Update Cars
        let activeCount = 0;
        this.cars.forEach(car => {
            if (car.finished) return;
            activeCount++;

            // Check Joints (Breaking)
            // Iterate backwards to remove
            for (let i = car.joints.length - 1; i >= 0; i--) {
                const j = car.joints[i];
                const data = j.getUserData(); // { breakForce, breakTorque, isBroken }

                if (data) {
                    const rForce = j.getReactionForce(1 / dt).length();
                    const rTorque = Math.abs(j.getReactionTorque(1 / dt));

                    if (rForce > data.breakForce || rTorque > data.breakTorque) {
                        this.world.destroyJoint(j);
                        car.joints.splice(i, 1);
                    }
                }
            }

            // Check Progress
            if (car.chassis) {
                const x = car.chassis.getPosition().x;
                if (x > car.maxX + MIN_PROGRESS) {
                    car.maxX = x;
                    car.lastProgressTime = this.time;
                }
            }

            // Check Stop Conditions
            // 1. Time limit (global or local?) -> Global 20s max
            if (this.time > MAX_TIME) {
                car.finished = true;
            }
            // 2. Stuck
            if (this.time - car.lastProgressTime > STOP_WAIT) {
                car.finished = true;
                // Sleep bodies to save CPU
                car.parts.forEach(b => b.setAwake(false));
            }

            car.fitness = Math.max(0, car.maxX);
        });
    }

    isGenerationFinished() {
        return this.cars.every(c => c.finished);
    }

    evolve() {
        // Collect results
        // pop array needs { dna, fitness }
        const results = this.cars.map(c => ({
            dna: c.dna,
            fitness: c.fitness
        }));

        // Stats
        const best = results.reduce((a, b) => a.fitness > b.fitness ? a : b);
        this.bestFitnessesByGen.push(best.fitness);

        // Next Gen
        const nextDNAs = nextGeneration(results);
        this.population = nextDNAs;
        this.generation++;

        this.startGeneration();
    }

    draw() {
        // Find leader (best fitness so far)
        // Or check dynamic x?
        // "Render only the champion (best of generation)"
        // This could mean "current best" or "best from previous result"?
        // Usually current leader.

        let leader = this.cars[0];
        this.cars.forEach(c => {
            if (c.maxX > leader.maxX) leader = c;
        });

        const cameraX = leader.chassis ? leader.chassis.getPosition().x : 0;

        render(this.ctx, this.world, cameraX, this.width, this.height, leader.carId);

        // Draw HUD
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`Gen: ${this.generation}`, 10, 20);
        this.ctx.fillText(`Time: ${this.time.toFixed(1)}s`, 10, 40);
        this.ctx.fillText(`Best: ${leader.maxX.toFixed(2)}m`, 10, 60);
        this.ctx.fillText(`Active: ${this.cars.filter(c => !c.finished).length}/${POP_SIZE}`, 10, 80);

        if (this.statsCallback) {
            this.statsCallback({
                generation: this.generation,
                bestFitness: leader.maxX
            });
        }
    }

    // Controls
    togglePause() {
        this.running = !this.running;
        if (this.running) this.loop();
    }

    setSpeed(s) {
        this.speed = s;
    }

    reset() {
        this.generation = 1;
        this.population = createFirstGeneration();
        this.startGeneration();
    }
}
