
import * as planck from 'planck-js';

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

        // Parts are initialized somewhat relative to root, 
        // but actually the joint anchors define the shape.
        // In the DNA, we don't store absolute positions.
        // We typically build the tree.
        // For physics body creation, we need an initial position.
        // We can build them all at 'position' and let the joints pull them,
        // OR we can calculate the layout.
        // DNA joints have 'anchor' relative to parent.
        // But part definition is just size/kind.

        // Simplified approach: Create all at 'position' (piled up)
        // and let Box2D resolve it? Might explode.
        // Better: Traverse the tree to calculate initial world positions.
        // But DNA doesn't enforce order 0 -> children.
        // We should sort or traverse.
        // Let's assume we can build them at position and spread slightly or
        // just let them snap (violent but works for GA).
        // Actually, for stability, let's try to place them based on anchors.
        // But DNA is 'anchor relative to parent'.
        // So we do need to traverse from ID 0.
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

        // Set carId
        body.setUserData({ carId: carId });

        let shape;
        if (partDef.kind === 'block' || partDef.kind === 'long_body' || partDef.kind === 'jetpack') {
            shape = planck.Box(partDef.w / 2, partDef.h / 2); // Box takes half-width/height
        } else if (partDef.kind === 'wheel' || partDef.kind === 'big_wheel') {
            shape = planck.Circle(partDef.radius);
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
                enableMotor: (definitions.get(j.childId).kind === 'wheel' || definitions.get(j.childId).kind === 'big_wheel'),
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
