import { describe, it, expect } from 'vitest';
import { getPartVisualStyle, getWheelDetailScale } from './partRegistry.js';

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
});
