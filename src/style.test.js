import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

describe('Sidebar contrast', () => {
    it('uses pixel-dark text color in the sidebar', () => {
        const css = readFileSync(new URL('../style.css', import.meta.url), 'utf-8');

        expect(css).toMatch(/#sidebar[\s\S]*color:\s*var\(--pixel-dark\);/);
    });

    it('keeps the sidebar in flow on small screens', () => {
        const css = readFileSync(new URL('../style.css', import.meta.url), 'utf-8');

        expect(css).toMatch(/@media\s*\(max-width:\s*768px\)[\s\S]*#sidebar[\s\S]*flex:\s*0 0 auto;/);
    });

    it('uses a readable font size for parts panel descriptions', () => {
        const css = readFileSync(new URL('../style.css', import.meta.url), 'utf-8');

        expect(css).toMatch(/\.panel-info[\s\S]*font-size:\s*11px;/);
    });

    it('uses a readable font size for part descriptions', () => {
        const css = readFileSync(new URL('../style.css', import.meta.url), 'utf-8');

        expect(css).toMatch(/\.part-desc\s*\{[^}]*font-size:\s*10px;/);
    });
});
