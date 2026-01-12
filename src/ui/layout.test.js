import { describe, it, expect } from 'vitest';
import { getMobileLayoutMode } from './layout.js';

describe('mobile layout detection', () => {
    it('returns portrait mode for mobile user agents', () => {
        const mode = getMobileLayoutMode({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' });

        expect(mode).toBe('mobile-portrait');
    });

    it('returns landscape mode when the viewport is wider than tall on mobile', () => {
        const mode = getMobileLayoutMode({
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            width: 812,
            height: 375
        });

        expect(mode).toBe('mobile-landscape');
    });
});
