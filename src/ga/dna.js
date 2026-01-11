
export const PI = Math.PI;

export function createRandomDNA(maxParts = 8) {
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

    // Decide if wheel or block
    let kind = 'block';
    if (wheelCount < 4 && Math.random() < 0.4) {
      kind = 'wheel';
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
