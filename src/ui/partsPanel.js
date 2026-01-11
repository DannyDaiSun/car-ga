/**
 * Parts Panel - displays available car part types
 */

// Part type definitions
const PART_TYPES = [
    { kind: 'block', label: 'Block', desc: 'Chassis/body segment' },
    { kind: 'wheel', label: 'Wheel', desc: 'Rotating motor wheel' },
];

/**
 * Initialize the parts panel toggle and populate the grid
 */
export function initPartsPanel() {
    const panel = document.getElementById('parts-panel');
    const toggle = document.getElementById('parts-toggle');
    const grid = document.getElementById('parts-grid');

    if (!panel || !toggle || !grid) return;

    // Toggle collapsed state on click
    toggle.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        toggle.textContent = panel.classList.contains('collapsed')
            ? '◀ Parts'
            : '▶ Parts';
    });

    // Populate grid with part types
    renderPartsList(grid);
}

/**
 * Render the list of available part types into the grid
 */
function renderPartsList(container) {
    container.innerHTML = '';

    PART_TYPES.forEach(part => {
        const slot = document.createElement('div');
        slot.className = 'part-slot';
        slot.title = part.desc;

        const icon = document.createElement('div');
        icon.className = `part-icon ${part.kind}`;

        const label = document.createElement('span');
        label.textContent = part.label;

        slot.appendChild(icon);
        slot.appendChild(label);
        container.appendChild(slot);
    });
}
