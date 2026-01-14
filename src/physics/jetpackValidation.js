/**
 * Jetpack Validation Module
 * Ensures jetpacks are properly attached to car bodies with wheels
 */

/**
 * Check if a part ID has at least one wheel in its subtree
 * @param {number} partId - The part ID to check
 * @param {Map} adjacencyMap - Map of parentId -> [{childId, jointDef}]
 * @param {Map} definitions - Map of partId -> partDef
 * @returns {boolean} True if this part or its descendants include a wheel
 */
function hasWheelInSubtree(partId, adjacencyMap, definitions) {
    const partDef = definitions.get(partId);
    if (!partDef) return false;

    // Check if this part is a wheel
    const wheelKinds = new Set(['wheel', 'big_wheel', 'small_wheel', 'tiny_wheel']);
    if (wheelKinds.has(partDef.kind)) {
        return true;
    }

    // Recursively check children
    const children = adjacencyMap.get(partId) || [];
    for (const childEntry of children) {
        if (hasWheelInSubtree(childEntry.childId, adjacencyMap, definitions)) {
            return true;
        }
    }

    return false;
}

/**
 * Get the parent of a part
 * @param {number} partId - The part ID
 * @param {Array} joints - Array of joint definitions
 * @returns {number|null} Parent ID or null if root
 */
function getParentId(partId, joints) {
    if (partId === 0) return null; // Root has no parent

    const parentJoint = joints.find(j => j.childId === partId);
    return parentJoint ? parentJoint.parentId : null;
}

/**
 * Check if a jetpack is properly attached
 * A jetpack is valid if:
 * 1. It's attached to a parent (not orphaned)
 * 2. The parent body has wheels in its subtree
 *
 * @param {Object} jetpackPart - The jetpack part definition
 * @param {Array} joints - Array of joint definitions
 * @param {Map} adjacencyMap - Map of parentId -> [{childId, jointDef}]
 * @param {Map} definitions - Map of partId -> partDef
 * @returns {boolean} True if jetpack is valid
 */
export function isJetpackValid(jetpackPart, joints, adjacencyMap, definitions) {
    const jetpackId = jetpackPart.id;

    // Find parent of this jetpack
    const parentId = getParentId(jetpackId, joints);
    if (parentId === null) {
        // Jetpack is root (not valid - need a body parent)
        return false;
    }

    // Check if parent body has wheels in its subtree
    // We need to check if the root has wheels, not just the parent
    // A jetpack is valid if the root (chassis) has wheels
    return hasWheelInSubtree(0, adjacencyMap, definitions);
}

/**
 * Validate all jetpacks in a car
 * Returns an array of jetpack part IDs that are invalid
 *
 * @param {Object} dna - The DNA object {parts: [], joints: []}
 * @returns {Array} Array of invalid jetpack part IDs
 */
export function validateJetpacks(dna) {
    if (!dna || !dna.parts || !Array.isArray(dna.parts)) {
        return [];
    }

    const { parts, joints = [] } = dna;
    const invalid = [];

    // Build adjacency map
    const adjacencyMap = new Map();
    const definitions = new Map();

    parts.forEach(p => definitions.set(p.id, p));
    joints.forEach(j => {
        if (!adjacencyMap.has(j.parentId)) {
            adjacencyMap.set(j.parentId, []);
        }
        adjacencyMap.get(j.parentId).push(j);
    });

    // Check each jetpack
    parts.forEach(partDef => {
        if (partDef.kind === 'jetpack') {
            if (!isJetpackValid(partDef, joints, adjacencyMap, definitions)) {
                invalid.push(partDef.id);
            }
        }
    });

    return invalid;
}

/**
 * Check if a car has valid jetpacks
 * @param {Object} car - The car object with dna and parts properties
 * @returns {boolean} True if all jetpacks are valid
 */
export function hasValidJetpacks(car) {
    const invalid = validateJetpacks(car.dna);
    return invalid.length === 0;
}

/**
 * Get invalid jetpack part IDs in a car
 * @param {Object} car - The car object with dna and parts properties
 * @returns {Array} Array of invalid jetpack part IDs
 */
export function getInvalidJetpacks(car) {
    return validateJetpacks(car.dna);
}
