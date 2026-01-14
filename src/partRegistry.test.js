import { describe, it, expect } from 'vitest';
import {
  getPartVisualStyle,
  getWheelDetailScale,
  getSpriteNameForPart,
  getShapeType,
  isWheelKind,
  hasMotor
} from './partRegistry.js';

describe('partRegistry', () => {
  it('getPartVisualStyle returns style object for valid part kind', () => {
    // Given a part kind 'wheel'
    const partKind = 'wheel';

    // When getPartVisualStyle is called
    const style = getPartVisualStyle(partKind);

    // Then it returns an object with fill, stroke, and accent colors
    expect(style.fill).toBeDefined();
  });

  it('getWheelDetailScale returns correct scale for wheel types', () => {
    // Given a wheel part kind 'big_wheel'
    const partKind = 'big_wheel';

    // When getWheelDetailScale is called
    const scale = getWheelDetailScale(partKind);

    // Then it returns the correct numeric scale factor
    expect(scale).toBe(0.45);
  });

  it('getSpriteNameForPart returns sprite name for part kind', () => {
    // Given a part kind 'jetpack' and seed 0
    const partKind = 'jetpack';
    const seed = 0;

    // When getSpriteNameForPart is called
    const spriteName = getSpriteNameForPart(partKind, seed);

    // Then it returns the correct sprite asset name
    expect(spriteName).toBe('cyber_booster_rocket');
  });

  it('getShapeType returns correct shape for part kinds', () => {
    // Given a part kind 'wheel'
    const partKind = 'wheel';

    // When getShapeType is called
    const shapeType = getShapeType(partKind);

    // Then it returns 'circle'
    expect(shapeType).toBe('circle');
  });

  it('isWheelKind identifies wheel parts correctly', () => {
    // Given a part kind 'tiny_wheel'
    const partKind = 'tiny_wheel';

    // When isWheelKind is called
    const result = isWheelKind(partKind);

    // Then it returns true
    expect(result).toBe(true);
  });

  it('hasMotor returns true for all wheel types', () => {
    // Given a part kind 'small_wheel'
    const partKind = 'small_wheel';

    // When hasMotor is called
    const result = hasMotor(partKind);

    // Then it returns true
    expect(result).toBe(true);
  });
});
