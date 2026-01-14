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

  // B-021519: Verify visual styles are consistent across modules
  it('visual styles are consistent for all part kinds', () => {
    // Given various part kinds
    const partKinds = ['block', 'wheel', 'jetpack', 'long_body'];

    // When getting styles from registry
    partKinds.forEach(kind => {
      const style = getPartVisualStyle(kind);

      // Then each style has all required properties
      expect(style.fill).toBeDefined();
      expect(style.stroke).toBeDefined();
      expect(style.accent).toBeDefined();
    });
  });

  // B-021520: Verify sprite names are consistent
  it('sprite names are deterministic for same seed', () => {
    // Given a part kind and seed
    const partKind = 'wheel';
    const seed = 42;

    // When getting sprite name multiple times
    const sprite1 = getSpriteNameForPart(partKind, seed);
    const sprite2 = getSpriteNameForPart(partKind, seed);

    // Then results are identical
    expect(sprite1).toBe(sprite2);
  });

  // B-021521: Registry handles unknown part kinds gracefully
  it('registry returns defaults for unknown part kinds', () => {
    // Given an unknown part kind
    const unknownKind = 'nonexistent_part';

    // When calling registry functions
    const style = getPartVisualStyle(unknownKind);
    const sprite = getSpriteNameForPart(unknownKind, 0);
    const shapeType = getShapeType(unknownKind);

    // Then sensible defaults are returned
    expect(style).toBeDefined(); // Should return default block style
    expect(sprite).toBeDefined(); // Should return default sprite
    expect(shapeType).toBe('box'); // Default to box shape
  });
});
