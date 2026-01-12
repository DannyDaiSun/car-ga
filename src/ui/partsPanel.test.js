// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { initPartsPanel } from './partsPanel.js';

describe('parts panel icons', () => {
    it('renders canvas previews for part icons', () => {
        document.body.innerHTML = `
            <div id="parts-panel">
                <div id="parts-grid"></div>
            </div>
            <button id="parts-toggle"></button>
        `;

        const app = {
            unlockedParts: new Set(['block', 'wheel']),
            money: 0,
            unlockPart: () => {}
        };

        initPartsPanel(app);

        const icon = document.querySelector('.part-slot .part-icon');

        expect(icon?.tagName).toBe('CANVAS');
    });
});
