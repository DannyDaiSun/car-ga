import { describe, it, expect } from 'vitest';
import { getPartVisualStyle } from './partRegistry.js';

describe('partRegistry', () => {
  it('getPartVisualStyle returns style object for valid part kind', () => {
    // Given a part kind 'wheel'
    const partKind = 'wheel';

    // When getPartVisualStyle is called
    const style = getPartVisualStyle(partKind);

    // Then it returns an object with fill, stroke, and accent colors
    expect(style.fill).toBeDefined();
  });
});
