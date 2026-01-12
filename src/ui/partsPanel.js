import { PART_DEFINITIONS } from '../gameConfig.js';

/**
 * Initialize the parts panel toggle and populate the grid
 * @param {App} app - The main App instance
 */
export function initPartsPanel(app) {
    const panel = document.getElementById('parts-panel');
    const toggle = document.getElementById('parts-toggle');
    const grid = document.getElementById('parts-grid');
    const moneyDisplay = document.getElementById('money-display'); // We might need to create this

    if (!panel || !toggle || !grid) return;

    // Toggle collapsed state on click
    let isThrottled = false;
    toggle.addEventListener('click', () => {
        if (isThrottled) return;

        panel.classList.toggle('collapsed');
        toggle.textContent = panel.classList.contains('collapsed')
            ? '◀ Parts'
            : '▶ Parts';

        // Block further clicks for the duration of the transition (300ms)
        isThrottled = true;
        setTimeout(() => {
            isThrottled = false;
        }, 300);
    });

    // Populate grid with part types
    // We pass a valid refresh function to re-render when things change
    const refresh = () => {
        renderPartsList(grid, app, refresh);
        updateMoneyDisplay(app);
    };

    // Initial render
    refresh();

    // Export a method to update badge from App
    app.updateStoreBadge = () => {
        updateBadge(app, toggle);
    };

    // Run badge check immediately
    app.updateStoreBadge();
}

/**
 * Check if any locked part is affordable and show/hide badge
 */
function updateBadge(app, toggle) {
    if (!toggle) return;

    let hasAffordable = false;
    // Check all definitions, if locked and affordable
    for (const part of Object.values(PART_DEFINITIONS)) {
        if (!app.unlockedParts.has(part.id) && app.money >= part.price) {
            hasAffordable = true;
            break;
        }
    }

    let badge = toggle.querySelector('.badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'badge';
        toggle.appendChild(badge);
    }

    badge.style.display = hasAffordable ? 'block' : 'none';
}

function updateMoneyDisplay(app) {
    // Assuming we add a money element in index.html, or we inject it here
    let el = document.getElementById('panel-money');
    if (!el) {
        const p = document.getElementById('parts-panel');
        el = document.createElement('div');
        el.id = 'panel-money';
        el.style.padding = '10px';
        el.style.fontWeight = 'bold';
        el.style.color = '#ffd700'; // Gold
        p.insertBefore(el, p.querySelector('#parts-grid'));
    }
    el.textContent = `Money: $${app.money}`;
}

/**
 * Render the list of available part types into the grid
 */
function renderPartsList(container, app, refreshCallback) {
    container.innerHTML = '';

    // Add Explanatory Text
    const info = document.createElement('div');
    info.className = 'panel-info';
    info.textContent = "Reach distance milestones to earn money (every 50m). Buy parts to evolve better cars.";
    container.appendChild(info);

    Object.values(PART_DEFINITIONS).forEach(part => {
        const slot = document.createElement('div');
        slot.className = 'part-slot';
        if (!app.unlockedParts.has(part.id)) {
            slot.classList.add('locked');
        }
        slot.title = part.desc;

        const icon = document.createElement('div');
        icon.className = `part-icon ${part.kind}`;
        // Unique styling for new parts?
        if (part.id === 'big_wheel') icon.style.borderRadius = '50%';
        if (part.id === 'jetpack') icon.style.backgroundColor = 'orange';

        const info = document.createElement('div');
        info.className = 'part-info';

        const label = document.createElement('span');
        label.classList.add('part-name');
        label.textContent = part.label;

        info.appendChild(label);

        // Buy/Status section
        if (app.unlockedParts.has(part.id)) {
            const status = document.createElement('span');
            status.className = 'status-unlocked';
            status.textContent = '✔ Owned';
            info.appendChild(status);
        } else {
            const price = document.createElement('span');
            price.className = 'part-price';
            price.textContent = `$${part.price}`;
            info.appendChild(price);

            const buyBtn = document.createElement('button');
            buyBtn.className = 'buy-btn';
            buyBtn.textContent = 'Buy';
            if (app.money >= part.price) {
                buyBtn.onclick = () => {
                    app.money -= part.price;
                    app.unlockPart(part.id);
                    refreshCallback();
                };
            } else {
                buyBtn.disabled = true;
                buyBtn.title = 'Not enough money';
            }
            info.appendChild(buyBtn);
        }

        slot.appendChild(icon);
        slot.appendChild(info);
        container.appendChild(slot);
    });
}
