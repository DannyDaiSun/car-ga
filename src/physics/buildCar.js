
import * as planck from 'planck-js';

import assetDimensions from '../render/assetDimensions.json';
import * as partRegistry from '../partRegistry.js';

const SCALE = 20; // Pixels per meter

export function buildCar(world, dna, position, carId) {
    const parts = new Map(); // id -> body
    const joints = [];

    // Collision filtering:
    // Category 2 = Car Part
    // Mask 1 = Ground (World static objects)
    const CAR_CATEGORY = 0x0002;
    const GROUND_CATEGORY = 0x0001;
    const CAR_MASK = GROUND_CATEGORY;

    // Create Bodies (Parts)
    dna.parts.forEach(partDef => {
        let body;
        const initPos = position.clone();
    });

    // 1. Organize tree
    const adj = new Map(); // parentId -> [{childId, jointDef}]
    const definitions = new Map();
    dna.parts.forEach(p => definitions.set(p.id, p));
    dna.joints.forEach(j => {
        if (!adj.has(j.parentId)) adj.set(j.parentId, []);
        adj.get(j.parentId).push(j);
    });

    // 2. Build recursively starting from Root
    // Helper to build
    function buildPart(partDef, pos, angle) {
        const type = 'dynamic';
        const body = world.createBody({
            type,
            position: pos,
            angle: angle,
            linearDamping: 0.0,
            angularDamping: 0.05
        });

        // Set carId and visual type
        // Use partDef.kind to determine visual asset
        // We can add simple logic to pick variants later if we want more randomness
        body.setUserData({
            carId: carId,
            partKind: partDef.kind, // 'block', 'wheel', 'long_body', 'jetpack', 'big_wheel'
            partId: partDef.id
        });

        // Determine correct dimension from assets
        let w = partDef.w;
        let h = partDef.h;
        let r = partDef.radius;

        // Visual Asset Logic - use partRegistry for sprite mapping
        const seed = (carId || 0) + (partDef.id || 0);
        const spriteName = partRegistry.getSpriteNameForPart(partDef.kind, seed);

        // Apply visual dimensions if asset exists
        if (spriteName && assetDimensions[spriteName]) {
            const dims = assetDimensions[spriteName];
            // Convert pixels to meters
            // Scale down by 0.25 to keep parts reasonably sized
            const SPRITE_SCALE = 0.25;
            w = (dims.w / SCALE) * SPRITE_SCALE;
            h = (dims.h / SCALE) * SPRITE_SCALE;
            // For wheels, approximate radius
            r = Math.min(w, h) / 2;
        }

        // Use partRegistry for shape type determination
        let shape;
        const shapeType = partRegistry.getShapeType(partDef.kind);
        if (shapeType === 'circle') {
            shape = planck.Circle(r);
        } else {
            shape = planck.Box(w / 2, h / 2);
        }

        body.createFixture({
            shape: shape,
            density: partDef.density,
            friction: partDef.friction,
            filterCategoryBits: CAR_CATEGORY,
            filterMaskBits: CAR_MASK,
            filterGroupIndex: -1 // Backup to prevent self-collision
        });

        parts.set(partDef.id, body);
        return body;
    }

    // BFS or DFS to build
    const queue = [{ id: 0, pos: position, angle: 0 }];
    const visited = new Set();

    while (queue.length > 0) {
        const { id, pos, angle } = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);

        const partDef = definitions.get(id);
        if (!partDef) continue; // Should not happen in valid DNA

        const body = buildPart(partDef, pos, angle);

        // Process children
        const children = adj.get(id) || [];
        for (const j of children) {
            // Calculate child position based on joint anchor
            // Joint has anchorX/Y relative to Parent.
            // But we don't know where the Child *center* should be relative to that anchor?
            // Usually standard logic: Two bodies, two anchors.
            // DNA spec: `anchorX, anchorY` (singular).
            // "anchorX, anchorY, jointType...".
            // Typically this means the anchor ON THE PARENT.
            // Where does it attach to the child?
            // If not specified, maybe child center? Or DNA needs 2 anchors?
            // SOP: "joints entries: { childId, parentId, anchorX, anchorY... }"
            // Ambiguous. Let's assume anchor is on Parent, and Child attaches at its Center?
            // OR the single anchor is the world space point? No, DNA is relative.
            // Let's assume Anchor is on Parent, and Child Center is mapped to that Anchor?
            // That would put the wheel/block center exactly on the joint.
            // This is plausible for "building block" style. 

            // Calc world point for anchor
            // Parent Body Local point (anchorX, anchorY) -> World Point
            const anchorLocal = planck.Vec2(j.anchorX, j.anchorY);
            const anchorWorld = body.getWorldPoint(anchorLocal);

            // So Child Body will be created at anchorWorld
            queue.push({ id: j.childId, pos: anchorWorld, angle: 0 });
        }
    }

    // 3. Create Joints
    // Now that all bodies exist
    dna.joints.forEach(j => {
        const parent = parts.get(j.parentId);
        const child = parts.get(j.childId);
        if (!parent || !child) return;

        // Anchor in world space?
        // We know anchor is local to parent (j.anchorX, j.anchorY).
        // RevoluteJointDef usually takes world anchor.
        const anchorLocal = planck.Vec2(j.anchorX, j.anchorY);
        const anchorWorld = parent.getWorldPoint(anchorLocal);

        if (j.jointType === 'revolute') {
            const joint = planck.RevoluteJoint({
                enableLimit: j.enableLimit,
                lowerAngle: j.lowerAngle,
                upperAngle: j.upperAngle,
                enableMotor: partRegistry.hasMotor(definitions.get(j.childId).kind),
                motorSpeed: definitions.get(j.childId).motorSpeed || 0,
                maxMotorTorque: definitions.get(j.childId).maxMotorTorque || 0
            }, parent, child, anchorWorld);

            // Store break thresholds in userData for simulation step
            joint.setUserData({
                breakForce: j.breakForce,
                breakTorque: j.breakTorque,
                isBroken: false
            });

            world.createJoint(joint);
            joints.push(joint);
        }
    });

    return { parts, joints };
}
