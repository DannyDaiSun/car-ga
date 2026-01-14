import { describe, it, expect } from 'vitest';
import { getPartRenderStyle, getWheelDetailScale } from './renderWorld.js';
import * as partRegistry from '../partRegistry.js';

describe('renderWorld part styles', () => {
    // B-43: Given a part kind, When selecting render styles, Then jetpack styling differs from standard body styling.
    it('uses a distinct fill for jetpacks', () => {
        expect(getPartRenderStyle('jetpack').fill).not.toBe(getPartRenderStyle('block').fill);
    });

    // B-44: Given wheel part kinds, When selecting wheel detail scales, Then big wheels and tiny wheels use different detail sizes.
    it('uses different wheel detail scales for big and tiny wheels', () => {
        expect(getWheelDetailScale('big_wheel')).not.toBe(getWheelDetailScale('tiny_wheel'));
    });

    // B-021510: Given renderWorld needs to render a car part, When getPartRenderStyle is called, Then it delegates to partRegistry
    it('renderWorld uses registry for part styles', () => {
        // Given a part kind 'wheel'
        const partKind = 'wheel';

        // When getPartRenderStyle is called
        const renderStyle = getPartRenderStyle(partKind);
        const registryStyle = partRegistry.getPartVisualStyle(partKind);

        // Then it returns the same style from the registry
        expect(renderStyle.fill).toBe(registryStyle.fill);
    });
});
