/**
 * Quick GA Parameter Benchmark
 * Reduced grid for faster results.
 */

import * as planck from 'planck-js';

const PI = Math.PI;
const MAX_TIME = 20;
const STOP_WAIT = 3;
const MIN_PROGRESS = 0.05;
const TARGET_DISTANCE = 100;
const MAX_GENERATIONS = 100;

// Reduced grid - focus on most promising ranges
const PARAMETER_GRID = {
    popSize: [60],
    eliteCount: [2, 4, 6],
    crossoverRate: [0.7, 0.85, 0.95],
    mutRate: [0.02, 0.05],
    selectionPressure: [1.0, 1.5, 2.0]
};

const TRIALS_PER_CONFIG = 3;

// DNA Functions
function randomRange(min, max) { return Math.random() * (max - min) + min; }
function cloneDNA(dna) { return JSON.parse(JSON.stringify(dna)); }

function createRandomDNA() {
    const parts = [{ id: 0, kind: 'block', w: randomRange(0.5, 1.5), h: randomRange(0.5, 1.5), density: randomRange(1, 5), friction: randomRange(0.1, 0.9) }];
    const joints = [];
    const maxParts = 4 + Math.floor(Math.random() * 8);
    let partCount = 1, wheelCount = 0;

    while (partCount < maxParts) {
        const parentId = Math.floor(Math.random() * partCount);
        const id = partCount;
        let kind = 'block';
        if (wheelCount < 4 && Math.random() < 0.4) kind = 'wheel';

        if (kind === 'wheel') {
            parts.push({ id, kind: 'wheel', radius: randomRange(0.3, 0.8), density: randomRange(1, 4), friction: randomRange(0.2, 1.0), motorSpeed: randomRange(-20, 20), maxMotorTorque: randomRange(10, 100) });
            wheelCount++;
        } else {
            parts.push({ id, kind: 'block', w: randomRange(0.2, 1.0), h: randomRange(0.2, 1.0), density: randomRange(0.5, 3), friction: randomRange(0.1, 0.9) });
        }

        joints.push({ childId: id, parentId, anchorX: randomRange(-1, 1), anchorY: randomRange(-1, 1), jointType: 'revolute', enableLimit: Math.random() < 0.5, lowerAngle: randomRange(-PI / 4, 0), upperAngle: randomRange(0, PI / 4), breakForce: randomRange(500, 2000), breakTorque: randomRange(200, 1000) });
        partCount++;
    }
    return { parts, joints };
}

// Selection
function pickParentRoulette(pop, fitnesses, pressure = 1.0) {
    const weights = fitnesses.map(f => Math.pow(Math.max(0, f), pressure));
    const sumW = weights.reduce((a, b) => a + b, 0);
    if (sumW === 0) return cloneDNA(pop[Math.floor(Math.random() * pop.length)]);
    let r = Math.random() * sumW, cum = 0;
    for (let i = 0; i < pop.length; i++) { cum += weights[i]; if (cum >= r) return cloneDNA(pop[i]); }
    return cloneDNA(pop[pop.length - 1]);
}

// Mutation
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
function randDelta(m) { return (Math.random() * 2 - 1) * m; }

function mutatePerField(dna, rate) {
    dna.parts.forEach(p => {
        if (p.kind === 'wheel') {
            if (Math.random() < rate) p.radius = clamp(p.radius + randDelta(0.05), 0.2, 1.5);
            if (Math.random() < rate) p.motorSpeed = clamp(p.motorSpeed + randDelta(3), -50, 50);
        } else {
            if (Math.random() < rate) p.w = clamp(p.w + randDelta(0.1), 0.2, 3);
            if (Math.random() < rate) p.h = clamp(p.h + randDelta(0.1), 0.2, 3);
        }
    });
    dna.joints.forEach(j => {
        if (Math.random() < rate) j.anchorX = clamp(j.anchorX + randDelta(0.05), -2, 2);
        if (Math.random() < rate) j.anchorY = clamp(j.anchorY + randDelta(0.05), -2, 2);
    });
    return dna;
}

// Crossover
function buildAdjacency(dna) { const adj = new Map(); dna.parts.forEach(p => adj.set(p.id, [])); dna.joints.forEach(j => { if (adj.has(j.parentId)) adj.get(j.parentId).push(j); }); return adj; }
function getSubtreeIds(adj, rid, res = new Set()) { res.add(rid); (adj.get(rid) || []).forEach(c => getSubtreeIds(adj, c.childId, res)); return res; }

function subtreeCrossover(p1, p2) {
    let child = cloneDNA(p1);
    const ids1 = p1.parts.map(p => p.id).filter(id => id !== 0);
    const ids2 = p2.parts.map(p => p.id).filter(id => id !== 0);
    if (!ids1.length || !ids2.length) return child;

    const cutId1 = ids1[Math.floor(Math.random() * ids1.length)];
    const cutId2 = ids2[Math.floor(Math.random() * ids2.length)];
    const sub1 = getSubtreeIds(buildAdjacency(child), cutId1);
    const sub2 = getSubtreeIds(buildAdjacency(p2), cutId2);

    const joint1 = child.joints.find(j => j.childId === cutId1);
    if (!joint1) return child;

    const parentId = joint1.parentId;
    child.parts = child.parts.filter(p => !sub1.has(p.id));
    child.joints = child.joints.filter(j => !sub1.has(j.childId));

    let nextId = Math.max(...child.parts.map(p => p.id), 0) + 1;
    const idMap = new Map();
    for (const oldId of sub2) idMap.set(oldId, nextId++);

    for (const oldId of sub2) {
        const pDef = p2.parts.find(p => p.id === oldId);
        if (pDef) child.parts.push({ ...pDef, id: idMap.get(oldId) });
    }
    for (const j of p2.joints) {
        if (sub2.has(j.childId) && sub2.has(j.parentId)) child.joints.push({ ...j, childId: idMap.get(j.childId), parentId: idMap.get(j.parentId) });
    }
    child.joints.push({ ...joint1, childId: idMap.get(cutId2), parentId });

    return child;
}

function normalizeAndClamp(dna) {
    let guard = 0;
    while (guard++ < 50 && (dna.parts.length > 12 || dna.parts.filter(p => p.kind === 'wheel').length > 4)) {
        const adj = buildAdjacency(dna);
        const leaves = dna.parts.filter(p => p.id !== 0 && (!adj.get(p.id) || adj.get(p.id).length === 0));
        if (!leaves.length) break;
        const target = leaves[Math.floor(Math.random() * leaves.length)];
        dna.parts = dna.parts.filter(p => p.id !== target.id);
        dna.joints = dna.joints.filter(j => j.childId !== target.id && j.parentId !== target.id);
    }
    const oldToNew = new Map();
    dna.parts.sort((a, b) => a.id - b.id);
    dna.parts.forEach((p, i) => { oldToNew.set(p.id, i); p.id = i; });
    dna.joints.forEach(j => { if (oldToNew.has(j.childId)) j.childId = oldToNew.get(j.childId); if (oldToNew.has(j.parentId)) j.parentId = oldToNew.get(j.parentId); });
    return dna;
}

// Evolution
function createFirstGeneration(n) { return Array.from({ length: n }, () => createRandomDNA()); }

function nextGeneration(prevPop, cfg) {
    const sorted = [...prevPop].sort((a, b) => b.fitness - a.fitness);
    const nextDNAs = sorted.slice(0, cfg.eliteCount).map(p => cloneDNA(p.dna));
    while (nextDNAs.length < cfg.eliteCount) nextDNAs.push(createRandomDNA());

    const dnas = prevPop.map(p => p.dna), fits = prevPop.map(p => p.fitness);
    while (nextDNAs.length < cfg.popSize) {
        const p1 = pickParentRoulette(dnas, fits, cfg.selectionPressure);
        const p2 = pickParentRoulette(dnas, fits, cfg.selectionPressure);
        let child = Math.random() < cfg.crossoverRate ? subtreeCrossover(p1, p2) : cloneDNA(p1);
        child = normalizeAndClamp(mutatePerField(child, cfg.mutRate));
        nextDNAs.push(child);
    }
    return nextDNAs;
}

// Track
function getTrackHeight(x) { if (x < 0) return 4; if (x < 10) return 0; return Math.sin(x * 0.1) * 2 + Math.sin(x * 0.5) * 1 + Math.sin(x * 1.3) * 0.5 * Math.max(0, (x - 10) / 50); }
function createTrack(world) {
    const ground = world.createBody({ type: 'static', position: planck.Vec2(0, 0) });
    const pts = [planck.Vec2(-10, 10), planck.Vec2(-10, 0)];
    for (let x = -5; x < 150; x++) pts.push(planck.Vec2(x, getTrackHeight(x)));
    ground.createFixture({ shape: planck.Chain(pts, false), friction: 0.8 });
}

// Build car
function buildCar(world, dna, pos, carId) {
    const parts = new Map(), joints = [];
    const defs = new Map(); dna.parts.forEach(p => defs.set(p.id, p));
    const adj = new Map(); dna.joints.forEach(j => { if (!adj.has(j.parentId)) adj.set(j.parentId, []); adj.get(j.parentId).push(j); });

    function build(pDef, p) {
        const body = world.createBody({ type: 'dynamic', position: p, linearDamping: 0, angularDamping: 0.05 });
        body.setUserData({ carId });
        const shape = pDef.kind === 'wheel' ? planck.Circle(pDef.radius) : planck.Box(pDef.w / 2, pDef.h / 2);
        body.createFixture({ shape, density: pDef.density, friction: pDef.friction, filterCategoryBits: 2, filterMaskBits: 1, filterGroupIndex: -1 });
        parts.set(pDef.id, body);
        return body;
    }

    const queue = [{ id: 0, pos }], visited = new Set();
    while (queue.length) {
        const { id, pos: p } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        const pDef = defs.get(id);
        if (!pDef) continue;
        const body = build(pDef, p);
        (adj.get(id) || []).forEach(j => queue.push({ id: j.childId, pos: body.getWorldPoint(planck.Vec2(j.anchorX, j.anchorY)) }));
    }

    dna.joints.forEach(j => {
        const parent = parts.get(j.parentId), child = parts.get(j.childId);
        if (!parent || !child) return;
        const anchor = parent.getWorldPoint(planck.Vec2(j.anchorX, j.anchorY));
        const cDef = defs.get(j.childId);
        const joint = planck.RevoluteJoint({ enableLimit: j.enableLimit, lowerAngle: j.lowerAngle, upperAngle: j.upperAngle, enableMotor: cDef.kind === 'wheel', motorSpeed: cDef.motorSpeed || 0, maxMotorTorque: cDef.maxMotorTorque || 0 }, parent, child, anchor);
        joint.setUserData({ breakForce: j.breakForce, breakTorque: j.breakTorque });
        world.createJoint(joint);
        joints.push(joint);
    });

    return { parts, joints };
}

// Simulate
function runGen(world, pop) {
    const cars = pop.map((dna, i) => {
        const { parts, joints } = buildCar(world, dna, planck.Vec2(0, 10), i);
        return { dna, chassis: parts.get(0), parts, joints, maxX: -100, lastProg: 0, done: false, fitness: 0 };
    });

    const dt = 1 / 60;
    for (let t = 0; t < MAX_TIME; t += dt) {
        world.step(dt);
        let allDone = true;
        cars.forEach(c => {
            if (c.done) return;
            allDone = false;
            for (let i = c.joints.length - 1; i >= 0; i--) {
                const j = c.joints[i], d = j.getUserData();
                if (d && (j.getReactionForce(1 / dt).length() > d.breakForce || Math.abs(j.getReactionTorque(1 / dt)) > d.breakTorque)) {
                    world.destroyJoint(j); c.joints.splice(i, 1);
                }
            }
            if (c.chassis) { const x = c.chassis.getPosition().x; if (x > c.maxX + MIN_PROGRESS) { c.maxX = x; c.lastProg = t; } }
            if (t - c.lastProg > STOP_WAIT) { c.done = true; c.parts.forEach(b => b.setAwake(false)); }
            c.fitness = Math.max(0, c.maxX);
        });
        if (allDone) break;
    }
    return cars.map(c => ({ dna: c.dna, fitness: c.fitness }));
}

// Experiment
function runExp(cfg) {
    let pop = createFirstGeneration(cfg.popSize), best = 0;
    for (let g = 1; g <= MAX_GENERATIONS; g++) {
        const world = planck.World({ gravity: planck.Vec2(0, -9.8) });
        createTrack(world);
        const res = runGen(world, pop);
        best = Math.max(best, Math.max(...res.map(r => r.fitness)));
        if (best >= TARGET_DISTANCE) return { gen: g, fitness: best, ok: true };
        pop = nextGeneration(res, cfg);
    }
    return { gen: MAX_GENERATIONS, fitness: best, ok: false };
}

// Grid search
function* genConfigs(grid) {
    const keys = Object.keys(grid), idx = keys.map(() => 0);
    while (true) {
        const cfg = {}; keys.forEach((k, i) => cfg[k] = grid[k][idx[i]]);
        yield cfg;
        let carry = true;
        for (let i = 0; i < keys.length && carry; i++) { idx[i]++; if (idx[i] >= grid[keys[i]].length) idx[i] = 0; else carry = false; }
        if (carry) break;
    }
}

async function main() {
    const results = [], configs = [...genConfigs(PARAMETER_GRID)];
    console.log(`\n========== QUICK GA BENCHMARK ==========`);
    console.log(`Testing ${configs.length} configs, ${TRIALS_PER_CONFIG} trials each\n`);

    let i = 0;
    for (const cfg of configs) {
        i++;
        const trials = Array.from({ length: TRIALS_PER_CONFIG }, () => runExp(cfg));
        const ok = trials.filter(t => t.ok).length;
        const avgGen = trials.reduce((a, t) => a + t.gen, 0) / TRIALS_PER_CONFIG;
        const avgFit = trials.reduce((a, t) => a + t.fitness, 0) / TRIALS_PER_CONFIG;
        results.push({ cfg, okRate: ok / TRIALS_PER_CONFIG, avgGen, avgFit });
        console.log(`[${i}/${configs.length}] elite=${cfg.eliteCount} xover=${cfg.crossoverRate} mut=${cfg.mutRate} pres=${cfg.selectionPressure} | ${ok}/${TRIALS_PER_CONFIG} ok | avgGen=${avgGen.toFixed(1)} | avgFit=${avgFit.toFixed(1)}m`);
    }

    results.sort((a, b) => b.okRate !== a.okRate ? b.okRate - a.okRate : a.avgGen - b.avgGen);

    console.log(`\n========== TOP 5 ==========\n`);
    for (let i = 0; i < Math.min(5, results.length); i++) {
        const r = results[i];
        console.log(`#${i + 1}: ${(r.okRate * 100).toFixed(0)}% success, avgGen=${r.avgGen.toFixed(1)}`);
        console.log(`   eliteCount=${r.cfg.eliteCount}, crossoverRate=${r.cfg.crossoverRate}, mutRate=${r.cfg.mutRate}, selectionPressure=${r.cfg.selectionPressure}\n`);
    }

    if (results.length) {
        const b = results[0].cfg;
        console.log(`========== RECOMMENDED evolve.js VALUES ==========`);
        console.log(`const ELITE_COUNT = ${b.eliteCount};`);
        console.log(`const CROSSOVER_RATE = ${b.crossoverRate};`);
        console.log(`// Use mutRate = ${b.mutRate} and selectionPressure = ${b.selectionPressure}`);
    }

    const fs = await import('fs');
    fs.writeFileSync('./benchmark_results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to benchmark_results.json');
}

main().catch(console.error);
