
import * as planck from 'planck-js';
import { createTrack } from '../physics/track.js';
import { buildCar } from '../physics/buildCar.js';
import { createFirstGeneration, nextGeneration } from '../ga/evolve.js';
import { render } from '../render/renderWorld.js';
import { ECONOMY } from '../gameConfig.js';


const STOP_WAIT = 3; // seconds
const MIN_PROGRESS = 0.05; // meters

export class App {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // GA Settings (configurable)
        this.popSize = options.popSize ?? 100;
        this.mutRate = options.mutRate ?? 0.02;
        this.maxParts = options.maxParts ?? 8;

        // Economy & State
        this.money = 0;
        this.unlockedParts = new Set(['block', 'wheel']);
        this.lastMilestone = 0; // For economy rewards
        this.historicalMaxX = 0;

        this.generation = 1;
        this.population = createFirstGeneration(this.popSize, this.maxParts, this.unlockedParts);
        this.bestFitnessesByGen = [];

        this.running = false;
        this.speed = 1;

        // Simulation State
        this.world = null;
        this.cars = [];
        this.time = 0;

        this.requestRef = null;
        this.statsCallback = null;
        this.cameraX = 0;
    }

    addMoney(amount) {
        this.money += amount;
        this.showToast(`Milestone Reached! +$${amount}`);
        if (this.updateStoreBadge) this.updateStoreBadge();
    }

    unlockPart(partId) {
        this.unlockedParts.add(partId);
    }

    showToast(msg) {
        const container = document.getElementById('game-container') || document.body;
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = msg;
        container.appendChild(toast);
        // CSS animation handles fadeout, but we should remove element
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3000);
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
        const steps = Math.min(5, Math.ceil(this.speed));
        const dt = (1 / 60) * (this.speed / steps);

        for (let s = 0; s < steps; s++) {
            if (this.isGenerationFinished()) {
                this.evolve();
                break;
            }
            this.stepSimulation(dt);
        }

        // Render
        this.draw();

        if (!this.running) return;
        this.requestRef = requestAnimationFrame(() => this.loop());
    }

    stepSimulation(dt = 1 / 60) {
        this.time += dt;

        // Step Physics
        this.world.step(dt);

        // Update Cars
        let activeCount = 0;
        this.cars.forEach(car => {
            if (car.finished) return;
            activeCount++;

            // Apply Jetpack Forces
            car.parts.forEach((body, partId) => {
                // We need to look up the part definition from the DNA to know if it's a jetpack
                // But map is id->body. We have dna.parts array.
                // Helper: find partDef for this body
                const partDef = car.dna.parts.find(p => p.id === partId);
                if (partDef && partDef.kind === 'jetpack') {
                    // Apply force in local 'right' direction (or up?)
                    // Usually jetpack pushes forward or up. Let's say forward-ish relative to body angle.
                    // Or standard: Apply force at center in local positive X direction?
                    // "Thrust" property in DNA.
                    const thrust = partDef.thrust || 100;
                    const f = body.getWorldVector(planck.Vec2(Math.cos(0), Math.sin(0))); // Local right ?
                    // Actually, if we want it to push "forward", it depends on how the part is oriented.
                    // block w/h. Let's assume force is along local X axis.
                    f.mul(thrust);

                    // Simple: Apply force to center
                    body.applyForceToCenter(f, true);
                }
            });

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
                    // Update historical max for mini-map
                    if (x > this.historicalMaxX) {
                        this.historicalMaxX = x;

                        // Check for money milestones
                        // e.g. every 50m
                        if (x > this.lastMilestone + ECONOMY.MILESTONE_DISTANCE) {
                            const milestonesPassed = Math.floor((x - this.lastMilestone) / ECONOMY.MILESTONE_DISTANCE);
                            if (milestonesPassed > 0) {
                                this.addMoney(milestonesPassed * ECONOMY.MONEY_PER_MILESTONE);
                                this.lastMilestone += milestonesPassed * ECONOMY.MILESTONE_DISTANCE;
                                // Force UI update if needed (will happen next draw)
                            }
                        }
                    }
                }
            }

            // Check Stop Conditions
            // 1. Time limit (global or local?) -> Global 20s max

            // 2. Stuck
            let waitLimit = STOP_WAIT;
            if (car.chassis) {
                const vel = car.chassis.getLinearVelocity().length();
                if (vel < 0.1) waitLimit = 0.5;
            }

            if (this.time - car.lastProgressTime > waitLimit) {
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
        const nextDNAs = nextGeneration(results, {
            popSize: this.popSize,
            mutRate: this.mutRate,
            maxParts: this.maxParts,
            unlockedParts: this.unlockedParts
        });
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

        // Prefer running cars; if all finished, take best overall
        const runningCars = this.cars.filter(c => !c.finished);
        let leader;
        if (runningCars.length > 0) {
            leader = runningCars.reduce((a, b) => a.maxX > b.maxX ? a : b);
        } else {
            leader = this.cars.reduce((a, b) => a.maxX > b.maxX ? a : b);
        }

        const bestFitness = this.cars.length > 0
            ? Math.max(...this.cars.map(c => c.maxX))
            : 0;

        const targetCamX = leader.chassis ? leader.chassis.getPosition().x : 0;
        // Loose tracking: Lerp towards target
        const lerpFactor = 0.1;
        this.cameraX += (targetCamX - this.cameraX) * lerpFactor;

        const cameraX = this.cameraX;

        // Prepare mini-map data
        const miniMapData = {
            cars: this.cars.map(c => ({
                id: c.carId,
                x: c.chassis ? c.chassis.getPosition().x : 0,
                finished: c.finished
            })),
            historicalMaxX: this.historicalMaxX,
            trackedCarId: leader.carId,
            nextMilestone: this.lastMilestone + ECONOMY.MILESTONE_DISTANCE
        };

        render(this.ctx, this.world, cameraX, this.width, this.height, leader.carId, miniMapData);

        // Draw HUD
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`Gen: ${this.generation}`, 10, 20);
        this.ctx.fillText(`Time: ${this.time.toFixed(1)}s`, 10, 40);
        this.ctx.fillText(`Best: ${bestFitness.toFixed(2)}m`, 10, 60);
        this.ctx.fillText(`Active: ${this.cars.filter(c => !c.finished).length}/${this.popSize}`, 10, 80);
        this.ctx.fillText(`Money: $${this.money}`, 10, 100);

        if (this.statsCallback) {
            this.statsCallback({
                generation: this.generation,
                bestFitness: bestFitness
            });
        }
    }

    // Controls
    togglePause() {
        if (this.running) {
            this.running = false;
            // Pause: stop the loop by canceling the next frame
            if (this.requestRef) {
                cancelAnimationFrame(this.requestRef);
                this.requestRef = null;
            }
            return;
        }
        this.running = true;
        this.loop();
    }

    setSpeed(s) {
        this.speed = s;
    }

    reset() {
        this.generation = 1;
        this.population = createFirstGeneration(this.popSize, this.maxParts, this.unlockedParts);
        this.startGeneration();
    }

    setSettings({ popSize, mutRate, maxParts }) {
        if (popSize !== undefined) this.popSize = popSize;
        if (mutRate !== undefined) this.mutRate = mutRate;
        if (maxParts !== undefined) this.maxParts = maxParts;
    }
}
