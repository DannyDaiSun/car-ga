
import { PART_DEFINITIONS } from '../gameConfig.js';

export const PI = Math.PI;

export function createRandomDNA(maxParts = 8, unlockedParts = new Set(['block', 'wheel'])) {
  const parts = [];
  const joints = [];

  // Root Part (ID 0)
  parts.push({
    id: 0,
    kind: 'block',
    w: randomRange(0.5, 1.5),
    h: randomRange(0.5, 1.5),
    density: randomRange(1, 5),
    friction: randomRange(0.1, 0.9)
  });

  // Randomly generate 1-3 wheels + extra parts (up to max 12 total parts)
  // For V1, let's keep it simple: Start with root, add some random limbs/wheels.
  // We'll enforce the "tree" property by picking an existing part as parent.

  const targetParts = Math.min(12, Math.max(2, maxParts)); // Clamp between 2 and 12
  let partCount = 1;
  let wheelCount = 0;

  while (partCount < targetParts) {
    const parentId = Math.floor(Math.random() * partCount); // Pick a random existing part
    const id = partCount;

    // Decide kind based on unlocked parts
    let kind = 'block';
    if (wheelCount < 4 && unlockedParts.has('wheel') && Math.random() < 0.4) {
      kind = 'wheel';
    } else if (Math.random() < 0.3) {
      // Try to pick a special part
      const options = [];
      if (unlockedParts.has('big_wheel') && wheelCount < 4) options.push('big_wheel');
      if (unlockedParts.has('long_body')) options.push('long_body');
      if (unlockedParts.has('jetpack')) options.push('jetpack');

      if (options.length > 0) {
        kind = options[Math.floor(Math.random() * options.length)];
      }
    }

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
    } else if (kind === 'big_wheel') {
      parts.push({
        id,
        kind: 'wheel', // Physics collision uses 'wheel' kind check? or should we keep specific kind?
        // PART_DEFINITIONS has kind: 'wheel', but the ID is 'big_wheel'.
        // Let's store internal kind as 'wheel' for physics compatibility, 
        // but maybe add a 'variant' field? OR just trust the props.
        // Actually, buildCar uses kind === 'wheel' for circle shape.
        // So we must set kind='wheel' in DNA, or update buildCar.
        // Let's update buildCar to handle detailed kinds OR map them here.
        // Better: DNA stores specific type. buildCar handles it.
        kind: 'big_wheel',
        radius: randomRange(PART_DEFINITIONS.big_wheel.minRadius, PART_DEFINITIONS.big_wheel.maxRadius),
        density: randomRange(1, 4),
        friction: randomRange(0.2, 1.0),
        motorSpeed: randomRange(-20, 20),
        maxMotorTorque: randomRange(10, 100)
      });
      wheelCount++;
    } else if (kind === 'long_body') {
      parts.push({
        id,
        kind: 'long_body',
        w: randomRange(PART_DEFINITIONS.long_body.minW, PART_DEFINITIONS.long_body.maxW),
        h: randomRange(PART_DEFINITIONS.long_body.minH, PART_DEFINITIONS.long_body.maxH),
        density: randomRange(0.5, 3),
        friction: randomRange(0.1, 0.9)
      });
    } else if (kind === 'jetpack') {
      parts.push({
        id,
        kind: 'jetpack',
        w: 0.5,
        h: 0.8,
        density: 1, // lighter?
        friction: 0.5,
        thrust: PART_DEFINITIONS.jetpack.thrust
      });
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

    // Connect with a joint
    // Anchor relative to parent (approximate on surface or corners)
    // To be simple, we pick random anchor on a unit square and rely on mutation to fix it,
    // or we can try to be smart. Let's be random but within reason (-1 to 1 local coords?)

    joints.push({
      childId: id,
      parentId: parentId,
      anchorX: randomRange(-1, 1), // Relative to parent center
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

export function validateDNA(dna) {
  // Ensure strict tree structure
  // Root is 0
  if (dna.parts.length === 0 || dna.parts[0].id !== 0) return false;

  // Check unique IDs and connectivity (not fully implementing graph check for perf, but basic checks)
  return true;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function cloneDNA(dna) {
  return JSON.parse(JSON.stringify(dna));
}
