import { describe, it, expect, beforeEach } from 'vitest';
import * as planck from 'planck-js';
import { buildCar } from './buildCar.js';

describe('buildCar', () => {
  let world;

  beforeEach(() => {
    // Create a fresh Planck world for each test
    world = planck.World({
      gravity: planck.Vec2(0, -10)
    });
  });

  it('small_wheel parts have motors enabled', () => {
    // Given a car DNA with a small_wheel attached to root
    const dna = {
      parts: [
        { id: 0, kind: 'block', w: 1, h: 0.5, density: 1, friction: 0.3 },
        { id: 1, kind: 'small_wheel', radius: 0.3, density: 1, friction: 0.9, motorSpeed: -20, maxMotorTorque: 50 }
      ],
      joints: [
        {
          childId: 1,
          parentId: 0,
          anchorX: 0.5,
          anchorY: -0.25,
          jointType: 'revolute',
          enableLimit: false,
          lowerAngle: 0,
          upperAngle: 0,
          breakForce: 1000,
          breakTorque: 1000
        }
      ]
    };

    const position = planck.Vec2(0, 5);
    const carId = 1;

    // When the car is built
    const { joints } = buildCar(world, dna, position, carId);

    // Then the joint should have enableMotor set to true
    expect(joints[0].isMotorEnabled()).toBe(true);
  });

  it('tiny_wheel parts have motors enabled', () => {
    // Given a car DNA with a tiny_wheel attached to root
    const dna = {
      parts: [
        { id: 0, kind: 'block', w: 1, h: 0.5, density: 1, friction: 0.3 },
        { id: 1, kind: 'tiny_wheel', radius: 0.2, density: 1, friction: 0.9, motorSpeed: -25, maxMotorTorque: 40 }
      ],
      joints: [
        {
          childId: 1,
          parentId: 0,
          anchorX: 0.5,
          anchorY: -0.25,
          jointType: 'revolute',
          enableLimit: false,
          lowerAngle: 0,
          upperAngle: 0,
          breakForce: 1000,
          breakTorque: 1000
        }
      ]
    };

    const position = planck.Vec2(0, 5);
    const carId = 1;

    // When the car is built
    const { joints } = buildCar(world, dna, position, carId);

    // Then the joint should have enableMotor set to true
    expect(joints[0].isMotorEnabled()).toBe(true);
  });
});
