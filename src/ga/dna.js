
import { PART_DEFINITIONS } from '../gameConfig.js';
import { getEvolutionConfig, getGameConfig } from '../utils/configLoader.js';

// Load configurations
const evolutionConfig = await getEvolutionConfig();
const gameConfig = await getGameConfig();

const MAX_PARTS = gameConfig.dna.maxParts;
const MIN_PARTS = gameConfig.dna.minParts;
const MAX_WHEELS = gameConfig.dna.maxWheels;
const WHEEL_PROBABILITY = evolutionConfig.dnaGeneration.wheelProbability;
const SPECIAL_PART_PROBABILITY = evolutionConfig.dnaGeneration.specialPartProbability;
const JOINT_ENABLE_LIMIT_PROBABILITY = evolutionConfig.dnaGeneration.jointEnableLimitProbability;

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

  // Randomly generate wheels + extra parts (up to max parts)
  // For V1, let's keep it simple: Start with root, add some random limbs/wheels.
  // We'll enforce the "tree" property by picking an existing part as parent.

  const targetParts = Math.min(MAX_PARTS, Math.max(MIN_PARTS, maxParts));
  let partCount = 1;
  let wheelCount = 0;

  while (partCount < targetParts) {
    const parentId = Math.floor(Math.random() * partCount); // Pick a random existing part
    const id = partCount;

    // Decide kind based on unlocked parts
    let kind = 'block';
    if (wheelCount < MAX_WHEELS && unlockedParts.has('wheel') && Math.random() < WHEEL_PROBABILITY) {
      kind = 'wheel';
    } else if (Math.random() < SPECIAL_PART_PROBABILITY) {
      // Try to pick a special part
      const options = [];
      if (unlockedParts.has('big_wheel') && wheelCount < MAX_WHEELS) options.push('big_wheel');
      if (unlockedParts.has('small_wheel') && wheelCount < MAX_WHEELS) options.push('small_wheel');
      if (unlockedParts.has('tiny_wheel') && wheelCount < MAX_WHEELS) options.push('tiny_wheel');
      if (unlockedParts.has('long_body')) options.push('long_body');
      if (unlockedParts.has('jetpack')) options.push('jetpack');

      if (options.length > 0) {
        kind = options[Math.floor(Math.random() * options.length)];
      }
    }

    if (kind === 'wheel') {
      const def = PART_DEFINITIONS.wheel;
      const baseMotorSpeed = randomRange(
        evolutionConfig.dnaGeneration.motorSpeed.min,
        evolutionConfig.dnaGeneration.motorSpeed.max
      );
      parts.push({
        id,
        kind: 'wheel',
        radius: randomRange(0.3, 0.8),
        density: randomRange(1, 4),
        friction: randomRange(0.2, 1.0),
        motorSpeed: baseMotorSpeed * def.motorMultiplier,
        maxMotorTorque: randomRange(
          evolutionConfig.dnaGeneration.maxMotorTorque.min,
          evolutionConfig.dnaGeneration.maxMotorTorque.max
        )
      });
      wheelCount++;
    } else if (kind === 'big_wheel') {
      parts.push({
        id,
        kind: 'big_wheel',
        radius: randomRange(PART_DEFINITIONS.big_wheel.minRadius, PART_DEFINITIONS.big_wheel.maxRadius),
        density: randomRange(1, 4),
        friction: randomRange(0.2, 1.0),
        motorSpeed: randomRange(
          evolutionConfig.dnaGeneration.motorSpeed.min,
          evolutionConfig.dnaGeneration.motorSpeed.max
        ),
        maxMotorTorque: randomRange(
          evolutionConfig.dnaGeneration.maxMotorTorque.min,
          evolutionConfig.dnaGeneration.maxMotorTorque.max
        )
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
    } else if (kind === 'small_wheel') {
      const def = PART_DEFINITIONS.small_wheel;
      const baseMotorSpeed = randomRange(
        evolutionConfig.dnaGeneration.motorSpeed.min,
        evolutionConfig.dnaGeneration.motorSpeed.max
      );
      parts.push({
        id,
        kind: 'small_wheel',
        radius: randomRange(def.minRadius, def.maxRadius),
        density: randomRange(1, 4),
        friction: randomRange(0.2, 1.0),
        motorSpeed: baseMotorSpeed * def.motorMultiplier,
        maxMotorTorque: randomRange(
          evolutionConfig.dnaGeneration.maxMotorTorque.min,
          evolutionConfig.dnaGeneration.maxMotorTorque.max
        ),
        breakMultiplier: def.breakMultiplier
      });
      wheelCount++;
    } else if (kind === 'tiny_wheel') {
      const def = PART_DEFINITIONS.tiny_wheel;
      const baseMotorSpeed = randomRange(
        evolutionConfig.dnaGeneration.motorSpeed.min,
        evolutionConfig.dnaGeneration.motorSpeed.max
      );
      parts.push({
        id,
        kind: 'tiny_wheel',
        radius: randomRange(def.minRadius, def.maxRadius),
        density: randomRange(1, 4),
        friction: randomRange(0.2, 1.0),
        motorSpeed: baseMotorSpeed * def.motorMultiplier,
        maxMotorTorque: randomRange(
          evolutionConfig.dnaGeneration.maxMotorTorque.min,
          evolutionConfig.dnaGeneration.maxMotorTorque.max
        ),
        breakMultiplier: def.breakMultiplier
      });
      wheelCount++;
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
      anchorX: randomRange(
        evolutionConfig.dnaGeneration.jointAnchors.min,
        evolutionConfig.dnaGeneration.jointAnchors.max
      ),
      anchorY: randomRange(
        evolutionConfig.dnaGeneration.jointAnchors.min,
        evolutionConfig.dnaGeneration.jointAnchors.max
      ),
      jointType: 'revolute',
      enableLimit: Math.random() < JOINT_ENABLE_LIMIT_PROBABILITY,
      lowerAngle: randomRange(
        evolutionConfig.dnaGeneration.jointAngles.lowerMin,
        evolutionConfig.dnaGeneration.jointAngles.lowerMax
      ),
      upperAngle: randomRange(
        evolutionConfig.dnaGeneration.jointAngles.upperMin,
        evolutionConfig.dnaGeneration.jointAngles.upperMax
      ),
      breakForce: randomRange(
        evolutionConfig.dnaGeneration.jointBreakForce.min,
        evolutionConfig.dnaGeneration.jointBreakForce.max
      ),
      breakTorque: randomRange(
        evolutionConfig.dnaGeneration.jointBreakTorque.min,
        evolutionConfig.dnaGeneration.jointBreakTorque.max
      )
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
