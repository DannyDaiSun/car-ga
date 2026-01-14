
import * as planck from 'planck-js';
import { createTrack, getTrackHeight } from '../physics/track.js';
import { buildCar } from '../physics/buildCar.js';
import { createFirstGeneration, nextGeneration } from '../ga/evolve.js';
import { isJetpackBoostActive } from '../physics/jetpack.js';
import { render } from '../render/renderWorld.js';
import { ECONOMY } from '../gameConfig.js';


const STOP_WAIT = 3; // seconds
const MIN_PROGRESS = 0.05; // meters

// Optimization: Staggered car creation
const CARS_PER_FRAME = 10; // Create 10 cars per frame

// Optimization: Directional culling (only cull cars behind champion)
const CULL_DISTANCE_BEHIND = 250; // meters behind champion
const REACTIVATE_DISTANCE = 150; // Re-add when closer than this
const MIN_VELOCITY_TO_CULL = 0.3; // Don't cull fast-moving cars
const DRAG_FACTOR = 0.96; // Velocity decay per frame for coasting

export class App {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // GA Settings (configurable)
        this.popSize = options.popSize ?? 200;
        this.mutRate = options.mutRate ?? 0.05;
        this.maxParts = options.maxParts ?? 12;

        // Economy & State
        this.money = ECONOMY.STARTING_MONEY;
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

        // Staggered car creation
        this.carsToCreate = [];
        this.creationIndex = 0;
        this.allCarsCreated = false;

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

        // Build Cars - Staggered across frames in gameplay, all at once in tests
        this.cars = [];
        this.time = 0;
        this.cameraX = 0;
        this.carsToCreate = [...this.population]; // Queue all cars to create
        this.creationIndex = 0;
        this.allCarsCreated = false;

        // Create first batch immediately so tests work and initial frame isn't empty
        // Subsequent frames will continue staggered creation if more cars remain
        this.createCarBatch();
    }

    createCarBatch() {
        // Create up to CARS_PER_FRAME cars this frame
        const startIdx = this.creationIndex;
        const endIdx = Math.min(this.creationIndex + CARS_PER_FRAME, this.carsToCreate.length);

        for (let i = startIdx; i < endIdx; i++) {
            const dna = this.carsToCreate[i];
            const startPos = planck.Vec2(0, 10); // Check QA-001: Increased from 4 to 10 to prevent clipping
            const { parts, joints } = buildCar(this.world, dna, startPos, i);

            // Find chassis (root)
            const chassis = parts.get(0);

            this.cars.push({
                carId: i,
                dna: dna,
                parts: parts,
                joints: joints,
                chassis: chassis,
                maxX: -100,
                lastProgressTime: 0,
                finished: false,
                fitness: 0,
                inSimulation: true,
                culled: false,
                velocity: 0,
                position: 0
            });
        }

        this.creationIndex = endIdx;
        this.allCarsCreated = this.creationIndex >= this.carsToCreate.length;
    }

    loop() {
        if (!this.running) return;

        // Create cars gradually if generation just started
        if (!this.allCarsCreated) {
            this.createCarBatch();
        }

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

        // Find leader for culling reference (only after some cars created)
        let leader = null;
        if (this.cars.length > 0) {
            const activeCars = this.cars.filter(c => !c.finished && c.inSimulation && c.chassis);
            if (activeCars.length > 0) {
                leader = activeCars.reduce((a, b) => a.chassis.getPosition().x > b.chassis.getPosition().x ? a : b);
            } else {
                // All cars finished or not yet created, use any with maxX
                leader = this.cars.reduce((a, b) => a.maxX > b.maxX ? a : b);
            }
        }

        // Directional Culling: Remove cars far behind champion and keep them coasting
        if (leader && leader.inSimulation && leader.chassis) {
            const leaderX = leader.chassis.getPosition().x;

            this.cars.forEach(car => {
                if (car.finished) return;
                // Ensure car has culling properties (for backward compatibility with tests)
                if (car.inSimulation === undefined) car.inSimulation = true;
                if (car.culled === undefined) car.culled = false;
                if (car.velocity === undefined) car.velocity = 0;
                if (car.position === undefined) car.position = car.maxX;

                if (!car.inSimulation) {
                    // Car is culled - update using coasting model
                    if (car.velocity > 0) {
                        car.velocity *= DRAG_FACTOR; // Apply drag
                        if (car.velocity < 0.01) car.velocity = 0;
                        car.position += car.velocity * dt;
                        car.maxX = Math.max(car.maxX, car.position);
                    }

                    // Check if car should be re-added (came back into range)
                    const relDistance = (car.position || car.maxX) - leaderX;
                    if (relDistance > -REACTIVATE_DISTANCE && car.dna) {
                        // Re-add to physics world
                        const trackHeight = getTrackHeight(car.position || car.maxX);
                        const pos = planck.Vec2(car.position || car.maxX, trackHeight + 1);
                        const { parts, joints } = buildCar(this.world, car.dna, pos, car.carId);
                        car.parts = parts;
                        car.joints = joints;
                        car.chassis = parts.get(0);
                        car.inSimulation = true;
                        car.culled = false;
                    }
                } else if (car.inSimulation && car.chassis) {
                    // Car is in simulation - check if it should be culled
                    const carX = car.chassis.getPosition().x;
                    const relDistance = carX - leaderX; // Negative if behind, positive if ahead
                    const velocity = Math.abs(car.chassis.getLinearVelocity().x);

                    // Only cull if: far behind AND slow moving AND not leader AND has valid dna
                    if (relDistance < -CULL_DISTANCE_BEHIND &&
                        velocity < MIN_VELOCITY_TO_CULL &&
                        car.carId !== leader.carId &&
                        car.dna) {

                        // Cull: Remove from physics world but track position/velocity
                        car.velocity = car.chassis.getLinearVelocity().x;
                        car.position = carX;
                        car.culled = true;
                        car.inSimulation = false;

                        // Destroy all bodies for this car
                        car.parts.forEach(b => this.world.destroyBody(b));
                    }
                }
            });
        }

        // Update Cars
        let activeCount = 0;
        this.cars.forEach(car => {
            if (car.finished) return;
            activeCount++;

            if (car.inSimulation && car.chassis) {
                const position = car.chassis.getPosition();
                if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
                    car.finished = true;
                    car.parts.forEach(b => b.setAwake(false));
                    car.fitness = Math.max(0, car.maxX);
                    return;
                }
            }

            // Apply Jetpack Forces (only for cars in simulation)
            if (car.inSimulation) {
                car.parts.forEach((body, partId) => {
                    // We need to look up the part definition from the DNA to know if it's a jetpack
                    // But map is id->body. We have dna.parts array.
                    // Helper: find partDef for this body
                    const partDef = car.dna.parts.find(p => p.id === partId);
                    if (partDef && partDef.kind === 'jetpack') {
                        if (!isJetpackBoostActive(this.time, partDef)) {
                            return;
                        }
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
            }

            // Check Joints (Breaking) - only for cars in simulation
            if (car.inSimulation) {
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
            }

            // Check Progress
            if (car.inSimulation && car.chassis) {
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
            if (car.inSimulation && car.chassis) {
                const vel = car.chassis.getLinearVelocity().length();
                if (vel < 0.1) waitLimit = 0.5;
            } else if (car.culled && car.velocity < 0.1) {
                // Culled cars: if coasting velocity too low, mark as finished
                waitLimit = 0;
            }

            if (this.time - car.lastProgressTime > waitLimit) {
                car.finished = true;
                // Sleep bodies to save CPU (only if in simulation)
                if (car.inSimulation) {
                    car.parts.forEach(b => b.setAwake(false));
                }
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

        // Get leader position (in simulation or culled)
        let targetCamX = 0;
        if (leader.inSimulation && leader.chassis) {
            targetCamX = leader.chassis.getPosition().x;
        } else if (leader.culled) {
            targetCamX = leader.position || leader.maxX;
        } else if (leader.chassis) {
            targetCamX = leader.chassis.getPosition().x;
        }

        // Loose tracking: Lerp towards target
        const lerpFactor = 0.1;
        this.cameraX += (targetCamX - this.cameraX) * lerpFactor;

        const cameraX = this.cameraX;

        // Prepare mini-map data
        const miniMapData = {
            cars: this.cars.map(c => {
                let carX = c.maxX;
                if (c.inSimulation && c.chassis) {
                    carX = c.chassis.getPosition().x;
                } else if (c.culled) {
                    carX = c.position || c.maxX;
                }
                return {
                    id: c.carId,
                    x: carX,
                    finished: c.finished
                };
            }),
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
        const activeInSim = this.cars.filter(c => !c.finished && c.inSimulation).length;
        const activeTotal = this.cars.filter(c => !c.finished).length;
        this.ctx.fillText(`Active: ${activeInSim}/${activeTotal}/${this.popSize}`, 10, 80);
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
