
import * as planck from 'planck-js';
import { createTrack } from './track.js';
import { buildCar } from './buildCar.js';

const TIME_STEP = 1 / 60;
const MAX_TIME = 20; // seconds
const MIN_PROGRESS_EPS = 0.05; // meters
const PROGRESS_TIMEOUT = 3; // seconds

export class Simulation {
    constructor(dna) {
        this.world = planck.World({
            gravity: planck.Vec2(0, -9.8),
        });

        this.track = createTrack(this.world);
        this.startPos = planck.Vec2(0, 10); // QA-001: Increased from 5 to 10

        const { parts, joints } = buildCar(this.world, dna, this.startPos, 0);
        this.parts = parts;
        this.joints = joints;

        this.time = 0;
        this.maxX = 0;
        this.lastProgressTime = 0;
        this.finished = false;

        // Find root body for tracking
        this.chassis = parts.get(0);
        if (this.chassis) {
            this.maxX = this.chassis.getPosition().x;
        }
    }

    step() {
        if (this.finished) return;

        this.world.step(TIME_STEP);
        this.time += TIME_STEP;

        // Check joints
        for (let i = this.joints.length - 1; i >= 0; i--) {
            const j = this.joints[i];
            const data = j.getUserData();

            if (!data) continue; // Should not happen

            // Reaction force/torque
            // getReactionForce returns force in Newtons (if inv_dt provided?)
            // Planck docs: getReactionForce(inv_dt)
            const rForce = j.getReactionForce(1 / TIME_STEP).length();
            const rTorque = Math.abs(j.getReactionTorque(1 / TIME_STEP));

            if (rForce > data.breakForce || rTorque > data.breakTorque) {
                this.world.destroyJoint(j);
                this.joints.splice(i, 1);
            }
        }

        // Update Progress
        if (this.chassis) {
            const x = this.chassis.getPosition().x;
            if (x > this.maxX + MIN_PROGRESS_EPS) {
                this.maxX = x;
                this.lastProgressTime = this.time;
            }
        }

        // Check Stop Conditions
        if (this.time >= MAX_TIME) {
            this.finished = true;
        }

        if (this.time - this.lastProgressTime > PROGRESS_TIMEOUT) {
            this.finished = true;
        }
    }

    getFitness() {
        // Distance is fitness.
        // Ensure non-negative
        return Math.max(0, this.maxX);
    }
}

export function evaluate(dna) {
    const sim = new Simulation(dna);
    while (!sim.finished) {
        sim.step();
    }
    return sim.getFitness();
}
