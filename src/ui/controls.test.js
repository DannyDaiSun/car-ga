// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { initControls } from './controls.js';

describe('UI controls', () => {
    it('invokes togglePause when the pause button is clicked', () => {
        document.body.innerHTML = `
            <button id="btn-start">PAUSE</button>
        `;

        const togglePause = vi.fn();
        const app = {
            running: true,
            togglePause: () => {
                app.running = !app.running;
                togglePause();
            }
        };

        initControls(app);

        document.getElementById('btn-start').click();

        expect(togglePause).toHaveBeenCalledTimes(1);
    });
});
