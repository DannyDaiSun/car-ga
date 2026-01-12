
import { cloneDNA, PI } from './dna.js';

// --- Helpers ---

function buildAdjacency(dna) {
    const adj = new Map(); // id -> [{childId, jointDef}]
    // Initialize for all parts
    dna.parts.forEach(p => adj.set(p.id, []));
    dna.joints.forEach(j => {
        if (adj.has(j.parentId)) {
            adj.get(j.parentId).push(j);
        }
    });
    return adj;
}

function getSubtreeIds(adj, rootId, result = new Set()) {
    result.add(rootId);
    const children = adj.get(rootId);
    if (children) {
        for (const c of children) {
            getSubtreeIds(adj, c.childId, result);
        }
    }
    return result;
}

function getAllIds(dna) {
    return new Set(dna.parts.map(p => p.id));
}

// --- Mutations ---

export function mutatePerField(dna, rate = 0.02) {
    // Modify numeric fields

    // Parts
    dna.parts.forEach(p => {
        const isWheel = ['wheel', 'big_wheel', 'small_wheel', 'tiny_wheel'].includes(p.kind);
        if (isWheel) {
            if (Math.random() < rate) p.radius = clamp(p.radius + randDelta(0.05), 0.08, 1.5);
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

    // Joints
    dna.joints.forEach(j => {
        if (Math.random() < rate) j.anchorX = clamp(j.anchorX + randDelta(0.05), -2, 2);
        if (Math.random() < rate) j.anchorY = clamp(j.anchorY + randDelta(0.05), -2, 2);
        if (Math.random() < rate) j.lowerAngle = clamp(j.lowerAngle + randDelta(0.1), -PI, 0);
        if (Math.random() < rate) j.upperAngle = clamp(j.upperAngle + randDelta(0.1), 0, PI);
        if (Math.random() < rate) j.breakForce = clamp(j.breakForce + randDelta(100), 10, 5000);
        if (Math.random() < rate) j.breakTorque = clamp(j.breakTorque + randDelta(50), 10, 5000);

        // Ensure angle limits sanity
        if (j.lowerAngle > j.upperAngle) {
            const t = j.lowerAngle; j.lowerAngle = j.upperAngle; j.upperAngle = t;
        }
    });

    return dna;
}

function randDelta(mag) {
    return (Math.random() * 2 - 1) * mag;
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

// --- Crossover ---

export function subtreeCrossover(p1, p2) {
    let child = cloneDNA(p1);

    // 1. Pick Cut Point in Child (copy of p1)
    // Must be non-root
    const ids1 = p1.parts.map(p => p.id).filter(id => id !== 0);
    if (ids1.length === 0) return child; // No subtrees to swap

    // 2. Pick Cut Point in p2
    const ids2 = p2.parts.map(p => p.id).filter(id => id !== 0);
    if (ids2.length === 0) return child; // p2 has no subtrees

    const cutId1 = ids1[Math.floor(Math.random() * ids1.length)];
    const cutId2 = ids2[Math.floor(Math.random() * ids2.length)];

    // 3. Identify Subtrees
    const adj1 = buildAdjacency(child);
    const sub1 = getSubtreeIds(adj1, cutId1);

    const adj2 = buildAdjacency(p2);
    const sub2 = getSubtreeIds(adj2, cutId2);

    // 4. Find Attachment Info for Cut1 (Parent in Child)
    // We need to know who 'cutId1' is attached to in 'child'
    const joint1 = child.joints.find(j => j.childId === cutId1);
    if (!joint1) return child; // Should not happen

    const parentId = joint1.parentId; // The staying parent
    const jointTemplate = { ...joint1 }; // Copy joint props

    // 5. Remove Subtree 1 from Child
    child.parts = child.parts.filter(p => !sub1.has(p.id));
    child.joints = child.joints.filter(j => !sub1.has(j.childId)); // Remove all joints where child is in subtree
    // Note: Joints INTERNAL to the subtree are removed because their ChildId is in the subtree.
    // The connection joint to the parent is also removed (childId=cutId1).

    // 6. Insert Subtree 2
    // We need to renumber Subtree 2 parts to avoid collisions with Child's existing parts.
    // Existing IDs in Child
    const existingIds = new Set(child.parts.map(p => p.id));
    let nextId = Math.max(...existingIds, 0) + 1;

    const idMap = new Map(); // p2 id -> new id
    for (const oldId of sub2) {
        idMap.set(oldId, nextId++);
    }

    // Add Parts
    for (const oldId of sub2) {
        const pDef = p2.parts.find(p => p.id === oldId);
        if (!pDef) continue;
        const newPart = { ...pDef, id: idMap.get(oldId) };
        child.parts.push(newPart);
    }

    // Add Internal Joints of Subtree 2
    for (const j of p2.joints) {
        if (sub2.has(j.childId) && sub2.has(j.parentId)) {
            child.joints.push({
                ...j,
                childId: idMap.get(j.childId),
                parentId: idMap.get(j.parentId)
            });
        }
    }

    // 7. Connect Subtree 2 Root to Parent
    // Root of Sub2 is cutId2
    const newRootId = idMap.get(cutId2);

    child.joints.push({
        ...jointTemplate, // Use the joint definition from the old branch
        childId: newRootId,
        parentId: parentId
        // anchorX, anchorY etc are preserved from p1's attachment point
    });

    return child;
}

// --- Normalization ---

export function normalizeAndClamp(dna) {
    // 1. Check Limits
    const MAX_PARTS = 12;
    const MAX_WHEELS = 4;

    // Prune if too many
    // Loop until compliant
    let loopGuard = 0;
    while (loopGuard++ < 50) {
        const parts = dna.parts;
        const wheels = parts.filter(p => p.kind === 'wheel').length;

        if (parts.length <= MAX_PARTS && wheels <= MAX_WHEELS) break;

        // Pick a leaf to prune
        const adj = buildAdjacency(dna);
        const leaves = parts.filter(p => p.id !== 0 && (!adj.has(p.id) || adj.get(p.id).length === 0));

        if (leaves.length === 0) break; // Should not happen if size > 1

        // Strategy: if wheels too many, prioritize wheel leaves
        let target = leaves[Math.floor(Math.random() * leaves.length)];
        if (wheels > MAX_WHEELS) {
            const wheelLeaves = leaves.filter(p => p.kind === 'wheel');
            if (wheelLeaves.length > 0) {
                target = wheelLeaves[Math.floor(Math.random() * wheelLeaves.length)];
            }
        }

        // Remove target
        dna.parts = dna.parts.filter(p => p.id !== target.id);
        dna.joints = dna.joints.filter(j => j.childId !== target.id);
        // Also remove any joints where it was a parent (it's a leaf so none, but for safety)
        dna.joints = dna.joints.filter(j => j.parentId !== target.id);
    }

    // 2. Renumber IDs to be 0..N-1 (Optional, but nice for clean internal state)
    // Actually, simple incrementing ID is safer?
    // Let's standardise IDs to be contiguous 0..Count-1
    // to keep ID numbers low.

    const oldToNew = new Map();
    // Root must be 0 and exist
    const root = dna.parts.find(p => p.id === 0);
    if (!root) {
        // Emergency repair: make first part root
        if (dna.parts.length > 0) dna.parts[0].id = 0;
    }

    // Sort parts so ID 0 is first, then rest
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
