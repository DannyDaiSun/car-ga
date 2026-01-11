/**
 * Headless GA Parameter Benchmark
 * 
 * Self-contained script that tests different GA parameters to find
 * optimal values for reaching 100m in the fewest generations.
 * 
 * This script duplicates the necessary GA/physics logic internally
 * so it doesn't modify any existing source files.
 * 
 * Usage: node benchmark.js
 */

import * as planck from 'planck-js';

// ============ CONSTANTS ============
const PI = Math.PI;
const MAX_TIME = 20;           // seconds per generation
const STOP_WAIT = 3;           // seconds without progress
const MIN_PROGRESS = 0.05;     // meters
const TARGET_DISTANCE = 100;   // goal
const MAX_GENERATIONS = 150;   // give up after this

// ============ PARAMETER GRID ============
const PARAMETER_GRID = {
    popSize: [60, 100],
    eliteCount: [2, 4, 6, 8, 10],
    crossoverRate: [0.7, 0.85, 0.95],
    mutRate: [0.02, 0.05, 0.08],
    selectionPressure: [1.0, 1.5, 2.0]
};

const TRIALS_PER_CONFIG = 2;

// ============ DNA FUNCTIONS ============
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function cloneDNA(dna) {
    return JSON.parse(JSON.stringify(dna));
}

function createRandomDNA() {
    const parts = [];
    const joints = [];

    parts.push({
        id: 0,
        kind: 'block',
        w: randomRange(0.5, 1.5),
        h: randomRange(0.5, 1.5),
        density: randomRange(1, 5),
        friction: randomRange(0.1, 0.9)
    });

    const maxParts = 4 + Math.floor(Math.random() * 8);
    let partCount = 1;
    let wheelCount = 0;

    while (partCount < maxParts) {
        const parentId = Math.floor(Math.random() * partCount);
        const id = partCount;

        let kind = 'block';
        if (wheelCount < 4 && Math.random() < 0.4) kind = 'wheel';

        if (kind === 'wheel') {
            parts.push({
                id,
                kind: 'wheel',
                radius: randomRange(0.3, 0.8),
                density: randomRange(1, 4),
                friction: randomRange(0.2, 1.0),
                motorSpeed: randomRange(-20, 20),
                maxMotorTorque: randomRange(10, 100)
            });
            wheelCount++;
        } else {
            parts.push({
                id,
                kind: 'block',
                w: randomRange(0.2, 1.0),
                h: randomRange(0.2, 1.0),
                density: randomRange(0.5, 3),
                friction: randomRange(0.1, 0.9)
            });
        }

        joints.push({
            childId: id,
            parentId: parentId,
            anchorX: randomRange(-1, 1),
            anchorY: randomRange(-1, 1),
            jointType: 'revolute',
            enableLimit: Math.random() < 0.5,
            lowerAngle: randomRange(-PI / 4, 0),
            upperAngle: randomRange(0, PI / 4),
            breakForce: randomRange(500, 2000),
            breakTorque: randomRange(200, 1000)
        });

        partCount++;
    }

    return { parts, joints };
}

// ============ SELECTION ============
function pickParentRoulette(pop, fitnesses, selectionPressure = 1.0) {
    const weights = fitnesses.map(f => Math.pow(Math.max(0, f), selectionPressure));
    const sumW = weights.reduce((a, b) => a + b, 0);

    if (sumW === 0) {
        return cloneDNA(pop[Math.floor(Math.random() * pop.length)]);
    }

    let r = Math.random() * sumW;
    let cum = 0;

    for (let i = 0; i < pop.length; i++) {
        cum += weights[i];
        if (cum >= r) return cloneDNA(pop[i]);
    }

    return cloneDNA(pop[pop.length - 1]);
}

// ============ MUTATION ============
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function randDelta(mag) {
    return (Math.random() * 2 - 1) * mag;
}

function mutatePerField(dna, rate) {
    dna.parts.forEach(p => {
        if (p.kind === 'wheel') {
            if (Math.random() < rate) p.radius = clamp(p.radius + randDelta(0.05), 0.2, 1.5);
            if (Math.random() < rate) p.density = clamp(p.density + randDelta(0.5), 0.1, 10);
            if (Math.random() < rate) p.friction = clamp(p.friction + randDelta(0.2), 0, 1);
            if (Math.random() < rate) p.motorSpeed = clamp(p.motorSpeed + randDelta(3), -50, 50);
            if (Math.random() < rate) p.maxMotorTorque = clamp(p.maxMotorTorque + randDelta(15), 0, 1000);
        } else {
            if (Math.random() < rate) p.w = clamp(p.w + randDelta(0.1), 0.2, 3);
            if (Math.random() < rate) p.h = clamp(p.h + randDelta(0.1), 0.2, 3);
            if (Math.random() < rate) p.density = clamp(p.density + randDelta(0.5), 0.1, 10);
            if (Math.random() < rate) p.friction = clamp(p.friction + randDelta(0.2), 0, 1);
        }
    });

    dna.joints.forEach(j => {
        if (Math.random() < rate) j.anchorX = clamp(j.anchorX + randDelta(0.05), -2, 2);
        if (Math.random() < rate) j.anchorY = clamp(j.anchorY + randDelta(0.05), -2, 2);
        if (Math.random() < rate) j.lowerAngle = clamp(j.lowerAngle + randDelta(0.1), -PI, 0);
        if (Math.random() < rate) j.upperAngle = clamp(j.upperAngle + randDelta(0.1), 0, PI);
        if (Math.random() < rate) j.breakForce = clamp(j.breakForce + randDelta(100), 10, 5000);
        if (Math.random() < rate) j.breakTorque = clamp(j.breakTorque + randDelta(50), 10, 5000);

        if (j.lowerAngle > j.upperAngle) {
            const t = j.lowerAngle; j.lowerAngle = j.upperAngle; j.upperAngle = t;
        }
    });

    return dna;
}

// ============ CROSSOVER ============
function buildAdjacency(dna) {
    const adj = new Map();
    dna.parts.forEach(p => adj.set(p.id, []));
    dna.joints.forEach(j => {
        if (adj.has(j.parentId)) adj.get(j.parentId).push(j);
    });
    return adj;
}

function getSubtreeIds(adj, rootId, result = new Set()) {
    result.add(rootId);
    const children = adj.get(rootId);
    if (children) {
        for (const c of children) getSubtreeIds(adj, c.childId, result);
    }
    return result;
}

function subtreeCrossover(p1, p2) {
    let child = cloneDNA(p1);

    const ids1 = p1.parts.map(p => p.id).filter(id => id !== 0);
    if (ids1.length === 0) return child;

    const ids2 = p2.parts.map(p => p.id).filter(id => id !== 0);
    if (ids2.length === 0) return child;

    const cutId1 = ids1[Math.floor(Math.random() * ids1.length)];
    const cutId2 = ids2[Math.floor(Math.random() * ids2.length)];

    const adj1 = buildAdjacency(child);
    const sub1 = getSubtreeIds(adj1, cutId1);

    const adj2 = buildAdjacency(p2);
    const sub2 = getSubtreeIds(adj2, cutId2);

    const joint1 = child.joints.find(j => j.childId === cutId1);
    if (!joint1) return child;

    const parentId = joint1.parentId;
    const jointTemplate = { ...joint1 };

    child.parts = child.parts.filter(p => !sub1.has(p.id));
    child.joints = child.joints.filter(j => !sub1.has(j.childId));

    const existingIds = new Set(child.parts.map(p => p.id));
    let nextId = Math.max(...existingIds, 0) + 1;

    const idMap = new Map();
    for (const oldId of sub2) idMap.set(oldId, nextId++);

    for (const oldId of sub2) {
        const pDef = p2.parts.find(p => p.id === oldId);
        if (!pDef) continue;
        child.parts.push({ ...pDef, id: idMap.get(oldId) });
    }

    for (const j of p2.joints) {
        if (sub2.has(j.childId) && sub2.has(j.parentId)) {
            child.joints.push({
                ...j,
                childId: idMap.get(j.childId),
                parentId: idMap.get(j.parentId)
            });
        }
    }

    child.joints.push({
        ...jointTemplate,
        childId: idMap.get(cutId2),
        parentId: parentId
    });

    return child;
}

function normalizeAndClamp(dna) {
    const MAX_PARTS = 12;
    const MAX_WHEELS = 4;

    let loopGuard = 0;
    while (loopGuard++ < 50) {
        const parts = dna.parts;
        const wheels = parts.filter(p => p.kind === 'wheel').length;

        if (parts.length <= MAX_PARTS && wheels <= MAX_WHEELS) break;

        const adj = buildAdjacency(dna);
        const leaves = parts.filter(p => p.id !== 0 && (!adj.has(p.id) || adj.get(p.id).length === 0));

        if (leaves.length === 0) break;

        let target = leaves[Math.floor(Math.random() * leaves.length)];
        if (wheels > MAX_WHEELS) {
            const wheelLeaves = leaves.filter(p => p.kind === 'wheel');
            if (wheelLeaves.length > 0) target = wheelLeaves[Math.floor(Math.random() * wheelLeaves.length)];
        }

        dna.parts = dna.parts.filter(p => p.id !== target.id);
        dna.joints = dna.joints.filter(j => j.childId !== target.id && j.parentId !== target.id);
    }

    const oldToNew = new Map();
    dna.parts.sort((a, b) => a.id - b.id);
    dna.parts.forEach((p, index) => {
        oldToNew.set(p.id, index);
        p.id = index;
    });
    dna.joints.forEach(j => {
        if (oldToNew.has(j.childId)) j.childId = oldToNew.get(j.childId);
        if (oldToNew.has(j.parentId)) j.parentId = oldToNew.get(j.parentId);
    });

    return dna;
}

// ============ EVOLUTION ============
function createFirstGeneration(popSize) {
    const pop = [];
    for (let i = 0; i < popSize; i++) pop.push(createRandomDNA());
    return pop;
}

function nextGeneration(prevPop, config) {
    const { popSize, eliteCount, crossoverRate, mutRate, selectionPressure } = config;

    const sorted = [...prevPop].sort((a, b) => b.fitness - a.fitness);

    const nextDNAs = [];
    for (let i = 0; i < eliteCount; i++) {
        if (sorted[i]) nextDNAs.push(cloneDNA(sorted[i].dna));
        else nextDNAs.push(createRandomDNA());
    }

    const dnas = prevPop.map(p => p.dna);
    const fitnesses = prevPop.map(p => p.fitness);

    while (nextDNAs.length < popSize) {
        const p1 = pickParentRoulette(dnas, fitnesses, selectionPressure);
        const p2 = pickParentRoulette(dnas, fitnesses, selectionPressure);

        let child;
        if (Math.random() < crossoverRate) child = subtreeCrossover(p1, p2);
        else child = cloneDNA(p1);

        child = mutatePerField(child, mutRate);
        child = normalizeAndClamp(child);

        nextDNAs.push(child);
    }

    return nextDNAs;
}

// ============ TRACK ============
function getTrackHeight(x) {
    if (x < 0) return 4;
    if (x < 10) return 0;
    return Math.sin(x * 0.1) * 2 + Math.sin(x * 0.5) * 1 + Math.sin(x * 1.3) * 0.5 * Math.max(0, (x - 10) / 50);
}

function createTrack(world) {
    const ground = world.createBody({ type: 'static', position: planck.Vec2(0, 0) });
    const points = [planck.Vec2(-10, 10), planck.Vec2(-10, 0)];
    for (let x = -5; x < 150; x += 1) points.push(planck.Vec2(x, getTrackHeight(x)));
    ground.createFixture({ shape: planck.Chain(points, false), friction: 0.8 });
    return ground;
}

// ============ BUILD CAR ============
function buildCar(world, dna, position, carId) {
    const parts = new Map();
    const joints = [];

    const CAR_CATEGORY = 0x0002;
    const GROUND_CATEGORY = 0x0001;

    const definitions = new Map();
    dna.parts.forEach(p => definitions.set(p.id, p));

    const adj = new Map();
    dna.joints.forEach(j => {
        if (!adj.has(j.parentId)) adj.set(j.parentId, []);
        adj.get(j.parentId).push(j);
    });

    function buildPart(partDef, pos) {
        const body = world.createBody({
            type: 'dynamic',
            position: pos,
            linearDamping: 0.0,
            angularDamping: 0.05
        });
        body.setUserData({ carId });

        let shape;
        if (partDef.kind === 'block') shape = planck.Box(partDef.w / 2, partDef.h / 2);
        else if (partDef.kind === 'wheel') shape = planck.Circle(partDef.radius);

        body.createFixture({
            shape,
            density: partDef.density,
            friction: partDef.friction,
            filterCategoryBits: CAR_CATEGORY,
            filterMaskBits: GROUND_CATEGORY,
            filterGroupIndex: -1
        });

        parts.set(partDef.id, body);
        return body;
    }

    const queue = [{ id: 0, pos: position }];
    const visited = new Set();

    while (queue.length > 0) {
        const { id, pos } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);

        const partDef = definitions.get(id);
        if (!partDef) continue;

        const body = buildPart(partDef, pos);

        const children = adj.get(id) || [];
        for (const j of children) {
            const anchorLocal = planck.Vec2(j.anchorX, j.anchorY);
            const anchorWorld = body.getWorldPoint(anchorLocal);
            queue.push({ id: j.childId, pos: anchorWorld });
        }
    }

    dna.joints.forEach(j => {
        const parent = parts.get(j.parentId);
        const child = parts.get(j.childId);
        if (!parent || !child) return;

        const anchorWorld = parent.getWorldPoint(planck.Vec2(j.anchorX, j.anchorY));

        if (j.jointType === 'revolute') {
            const joint = planck.RevoluteJoint({
                enableLimit: j.enableLimit,
                lowerAngle: j.lowerAngle,
                upperAngle: j.upperAngle,
                enableMotor: (definitions.get(j.childId).kind === 'wheel'),
                motorSpeed: definitions.get(j.childId).motorSpeed || 0,
                maxMotorTorque: definitions.get(j.childId).maxMotorTorque || 0
            }, parent, child, anchorWorld);

            joint.setUserData({ breakForce: j.breakForce, breakTorque: j.breakTorque });
            world.createJoint(joint);
            joints.push(joint);
        }
    });

    return { parts, joints };
}

// ============ SIMULATION ============
function runGeneration(world, population) {
    const cars = [];

    population.forEach((dna, index) => {
        const { parts, joints } = buildCar(world, dna, planck.Vec2(0, 10), index);
        const chassis = parts.get(0);
        cars.push({ dna, chassis, parts, joints, maxX: -100, lastProgressTime: 0, finished: false, fitness: 0 });
    });

    const dt = 1 / 60;
    let time = 0;

    while (time < MAX_TIME) {
        time += dt;
        world.step(dt);

        let allFinished = true;

        cars.forEach(car => {
            if (car.finished) return;
            allFinished = false;

            for (let i = car.joints.length - 1; i >= 0; i--) {
                const j = car.joints[i];
                const data = j.getUserData();
                if (data) {
                    const rForce = j.getReactionForce(1 / dt).length();
                    const rTorque = Math.abs(j.getReactionTorque(1 / dt));
                    if (rForce > data.breakForce || rTorque > data.breakTorque) {
                        world.destroyJoint(j);
                        car.joints.splice(i, 1);
                    }
                }
            }

            if (car.chassis) {
                const x = car.chassis.getPosition().x;
                if (x > car.maxX + MIN_PROGRESS) {
                    car.maxX = x;
                    car.lastProgressTime = time;
                }
            }

            if (time - car.lastProgressTime > STOP_WAIT) {
                car.finished = true;
                car.parts.forEach(b => b.setAwake(false));
            }

            car.fitness = Math.max(0, car.maxX);
        });

        if (allFinished) break;
    }

    return cars.map(c => ({ dna: c.dna, fitness: c.fitness }));
}

// ============ EXPERIMENT ============
function runExperiment(config) {
    let population = createFirstGeneration(config.popSize);
    let bestFitness = 0;

    for (let gen = 1; gen <= MAX_GENERATIONS; gen++) {
        const world = planck.World({ gravity: planck.Vec2(0, -9.8) });
        createTrack(world);

        const results = runGeneration(world, population);
        const best = results.reduce((a, b) => a.fitness > b.fitness ? a : b);
        bestFitness = Math.max(bestFitness, best.fitness);

        if (bestFitness >= TARGET_DISTANCE) {
            return { generations: gen, bestFitness, success: true };
        }

        population = nextGeneration(results, config);
    }

    return { generations: MAX_GENERATIONS, bestFitness, success: false };
}

// ============ GRID SEARCH ============
function* generateConfigs(grid) {
    const keys = Object.keys(grid);
    const indices = keys.map(() => 0);

    while (true) {
        const config = {};
        keys.forEach((k, i) => config[k] = grid[k][indices[i]]);
        yield config;

        let carry = true;
        for (let i = 0; i < keys.length && carry; i++) {
            indices[i]++;
            if (indices[i] >= grid[keys[i]].length) indices[i] = 0;
            else carry = false;
        }
        if (carry) break;
    }
}

async function runGridSearch() {
    const results = [];
    const configs = [...generateConfigs(PARAMETER_GRID)];
    const totalConfigs = configs.length;

    console.log(`\n========== GA PARAMETER BENCHMARK ==========`);
    console.log(`Testing ${totalConfigs} configurations, ${TRIALS_PER_CONFIG} trials each`);
    console.log(`Target: ${TARGET_DISTANCE}m in max ${MAX_GENERATIONS} generations\n`);

    let idx = 0;
    for (const config of configs) {
        idx++;
        const trials = [];

        for (let t = 0; t < TRIALS_PER_CONFIG; t++) {
            trials.push(runExperiment(config));
        }

        const successCount = trials.filter(r => r.success).length;
        const avgGen = trials.reduce((a, b) => a + b.generations, 0) / TRIALS_PER_CONFIG;
        const avgFit = trials.reduce((a, b) => a + b.bestFitness, 0) / TRIALS_PER_CONFIG;

        results.push({ config, successRate: successCount / TRIALS_PER_CONFIG, avgGen, avgFit, trials });

        console.log(`[${idx}/${totalConfigs}] pop=${config.popSize} elite=${config.eliteCount} xover=${config.crossoverRate} mut=${config.mutRate} pres=${config.selectionPressure}`);
        console.log(`   Success: ${successCount}/${TRIALS_PER_CONFIG} | Avg Gen: ${avgGen.toFixed(1)} | Avg Fit: ${avgFit.toFixed(1)}m\n`);
    }

    results.sort((a, b) => {
        if (b.successRate !== a.successRate) return b.successRate - a.successRate;
        return a.avgGen - b.avgGen;
    });

    console.log(`\n========== TOP 5 CONFIGURATIONS ==========\n`);
    for (let i = 0; i < Math.min(5, results.length); i++) {
        const r = results[i];
        console.log(`#${i + 1}: Success ${(r.successRate * 100).toFixed(0)}% | Avg Gen: ${r.avgGen.toFixed(1)}`);
        console.log(`   popSize=${r.config.popSize}, eliteCount=${r.config.eliteCount}, crossoverRate=${r.config.crossoverRate}, mutRate=${r.config.mutRate}, selectionPressure=${r.config.selectionPressure}\n`);
    }

    // Save results
    const fs = await import('fs');
    fs.writeFileSync('./benchmark_results.json', JSON.stringify(results, null, 2));
    console.log('Results saved to benchmark_results.json');

    // Print recommended values for evolve.js
    if (results.length > 0) {
        const best = results[0].config;
        console.log(`\n========== RECOMMENDED PARAMETERS FOR evolve.js ==========`);
        console.log(`const ELITE_COUNT = ${best.eliteCount};`);
        console.log(`const CROSSOVER_RATE = ${best.crossoverRate};`);
        console.log(`// mutRate = ${best.mutRate} (passed as argument)`);
        console.log(`// selectionPressure = ${best.selectionPressure} (add to select.js if desired)`);
        console.log(`// popSize = ${best.popSize} (passed as argument)`);
    }
}

runGridSearch().catch(console.error);
