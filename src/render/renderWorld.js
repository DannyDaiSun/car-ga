
import { PI } from '../ga/dna.js';
import * as planck from 'planck-js';
import { getTrackHeight } from '../physics/track.js';
import * as partRegistry from '../partRegistry.js';

const SCALE = 20; // pixels per meter

const visualAssets = {};
const ASSET_LIST = [
    'geo_body_sport', 'geo_body_truck', 'geo_wheel_mag',
    'cyber_engine_reactor', 'cyber_engine_v8cyber', 'cyber_engine_turbine',
    'cyber_booster_rocket'
];

function loadAssets() {
    if (typeof Image === 'undefined') {
        return;
    }
    ASSET_LIST.forEach(name => {
        const img = new Image();
        img.src = `/art/${name}.png`;
        visualAssets[name] = img;
    });
}
loadAssets();

// Delegate to partRegistry for styles and scales
export function getPartRenderStyle(partKind = 'block') {
    return partRegistry.getPartVisualStyle(partKind);
}

export function getWheelDetailScale(partKind = 'wheel') {
    return partRegistry.getWheelDetailScale(partKind);
}

export function render(ctx, world, cameraX, width, height, championId, miniMapData) {
    // Draw Sky - LCD Green
    ctx.fillStyle = '#c4f0c2';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Camera Transform
    ctx.translate(width / 4, height * 0.75);
    ctx.scale(SCALE, -SCALE);
    ctx.translate(-cameraX, 0);

    ctx.lineWidth = 2 / SCALE;

    // Render Ground (Static Bodies) first
    for (let b = world.getBodyList(); b; b = b.getNext()) {
        if (b.getType() === 'static') {
            renderBody(ctx, b, true);
        }
    }

    // Render Cars (Dynamic Bodies)
    // Only render champion's parts if championId is provided
    for (let b = world.getBodyList(); b; b = b.getNext()) {
        if (b.getType() !== 'static') {
            const userData = b.getUserData();
            if (userData && userData.carId === championId) {
                renderBody(ctx, b, false);
            }
        }
    }

    ctx.restore();

    // Draw Mini-Map
    if (miniMapData) {
        renderMiniMap(ctx, miniMapData, width, height);
    }
}

function renderBody(ctx, body, isStatic) {
    const pos = body.getPosition();
    const angle = body.getAngle();
    const userData = body.getUserData();

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    if (isStatic) {
        // Ground Rendering - Dark Pixel
        ctx.fillStyle = '#2f483a';
        ctx.strokeStyle = '#2f483a';
        renderShapes(ctx, body); // Keep shapes for ground
    } else {
        // Car Part Rendering - Distinct styles by part kind
        const style = getPartRenderStyle(userData?.partKind);
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        renderShapes(ctx, body);
        drawPartDetails(ctx, body, userData?.partKind, style);
        if (userData?.partKind === 'jetpack') {
            drawJetpackFlame(ctx, style.accent);
        }
    }
    ctx.restore();
}

function drawJetpackFlame(ctx, accent) {
    ctx.save();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-0.7, 0);
    ctx.lineTo(-0.2, 0.25);
    ctx.lineTo(-0.2, -0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawPartDetails(ctx, body, partKind, style) {
    if (!partKind) return;

    if (partKind === 'block') {
        const dims = getPolygonDimensions(body);
        if (!dims) return;
        ctx.save();
        ctx.fillStyle = style.accent;
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(dims.width, dims.height) * 0.12, 0, PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    if (partKind === 'long_body') {
        const dims = getPolygonDimensions(body);
        if (!dims) return;
        ctx.save();
        ctx.strokeStyle = style.accent;
        ctx.lineWidth = 0.06;
        ctx.beginPath();
        ctx.moveTo(-dims.width * 0.35, 0);
        ctx.lineTo(dims.width * 0.35, 0);
        ctx.stroke();
        ctx.restore();
        return;
    }

    if (partKind.includes('wheel')) {
        const radius = getCircleRadius(body);
        if (!radius) return;
        ctx.save();
        ctx.strokeStyle = style.accent;
        ctx.lineWidth = 0.08;
        ctx.beginPath();
        ctx.arc(0, 0, radius * getWheelDetailScale(partKind), 0, PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

function getCircleRadius(body) {
    const fixture = body.getFixtureList();
    if (!fixture) return null;
    const shape = fixture.getShape();
    if (!shape || shape.getType() !== 'circle') return null;
    return shape.getRadius();
}

function getPolygonDimensions(body) {
    const fixture = body.getFixtureList();
    if (!fixture) return null;
    const shape = fixture.getShape();
    if (!shape || shape.getType() !== 'polygon') return null;
    const vertices = shape.m_vertices;
    if (!vertices || !vertices.length) return null;
    let minX = vertices[0].x;
    let maxX = vertices[0].x;
    let minY = vertices[0].y;
    let maxY = vertices[0].y;
    for (let i = 1; i < vertices.length; i++) {
        minX = Math.min(minX, vertices[i].x);
        maxX = Math.max(maxX, vertices[i].x);
        minY = Math.min(minY, vertices[i].y);
        maxY = Math.max(maxY, vertices[i].y);
    }
    return { width: maxX - minX, height: maxY - minY };
}

function renderSprite(ctx, body, userData) {
    const { partKind, partId, carId } = userData;

    // Deterministic random choice based on carId + partId
    const seed = (carId || 0) + (partId || 0);

    // Use partRegistry for sprite mapping
    const spriteName = partRegistry.getSpriteNameForPart(partKind, seed);
    const img = visualAssets[spriteName];

    // Get dimensions from the first fixture (assuming single shape per body for simplicity)
    const f = body.getFixtureList();
    if (f && img && img.complete) {
        const shape = f.getShape();
        const type = shape.getType();

        let w, h;
        if (type === 'circle') {
            const r = shape.getRadius();
            w = r * 2.2; // Slightly larger than physics circle to look good
            h = r * 2.2;
        } else {
            // Polygon/Box. extracting width/height from vertices is hard generic.
            // But we know we built them as Boxes in buildCar.
            // Box vertices are locally axis aligned usually?
            // Let's assume standard box.
            // Or access userData if we stored w/h? We didn't.
            // Let's approximate from AABB of shape?
            // shape.computeAABB(aabb, transform, 0)? No, simpler:
            // vertices[0] is usually top-right or similar.
            // buildCar: Box(w/2, h/2).
            // Let's iterate vertices to find bounding box.
            if (type === 'polygon') {
                // Simple AABB of vertices
                const vertices = shape.m_vertices;
                let minX = 0, maxX = 0, minY = 0, maxY = 0;
                if (vertices && vertices.length) {
                    minX = vertices[0].x; maxX = vertices[0].x;
                    minY = vertices[0].y; maxY = vertices[0].y;
                    for (let i = 1; i < vertices.length; i++) {
                        minX = Math.min(minX, vertices[i].x);
                        maxX = Math.max(maxX, vertices[i].x);
                        minY = Math.min(minY, vertices[i].y);
                        maxY = Math.max(maxY, vertices[i].y);
                    }
                }
                w = (maxX - minX);
                h = (maxY - minY);
            }
        }

        if (w && h) {
            // Flip Y for image rendering because we are in physics Y-up 
            // BUT canvas `scale(SCALE, -SCALE)` flips Y.
            // So +Y is DOWN in image space if we draw normally?
            // Wait, we scaled context (SCALE, -SCALE).
            // So +Y in local coord goes UP on screen.
            // drawImage(img, 0, 0) draws strictly.
            // Images are usually "up is up".
            // If we draw normally, it will be upside down because of -SCALE Y.
            // So we need to flip Y again for the sprite.
            ctx.save();
            ctx.scale(1, -1);
            // Draw centered
            // Logic: physics body center is (0,0).
            // Image center should be at (0,0).
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
            return;
        }
    }

    // Fallback if no sprite matched or not loaded
    ctx.fillStyle = '#d9455f';
    ctx.strokeStyle = '#2f483a';
    renderShapes(ctx, body);
}

function renderShapes(ctx, body) {
    for (let f = body.getFixtureList(); f; f = f.getNext()) {
        const shape = f.getShape();
        const type = shape.getType();

        ctx.beginPath();
        if (type === 'circle') {
            const r = shape.getRadius();
            const center = shape.getCenter();
            ctx.arc(center.x, center.y, r, 0, 2 * PI);
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(center.x + r, center.y);
        } else if (type === 'polygon' || type === 'chain') {
            const vertices = shape.m_vertices;
            if (vertices && vertices.length) {
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let i = 1; i < vertices.length; i++) {
                    ctx.lineTo(vertices[i].x, vertices[i].y);
                }

                // Close shape
                if (type === 'chain' && body.getType() === 'static') {
                    // Ground fill logic
                    const last = vertices[vertices.length - 1];
                    const first = vertices[0];
                    const deepY = -100;

                    ctx.lineTo(last.x, deepY);
                    ctx.lineTo(first.x, deepY);
                    ctx.lineTo(first.x, first.y);
                } else {
                    ctx.closePath();
                }
            }
        }
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * Renders a mini-map bar at the bottom of the screen.
 * Shows terrain shape, all cars as dots at correct heights, and a flag at the historical max distance.
 */
function renderMiniMap(ctx, miniMapData, width, height) {
    const { cars, historicalMaxX, nextMilestone } = miniMapData;

    // Mini-map dimensions and position (bottom of screen, styled like LCD display)
    const mapHeight = 30; // Slightly taller to show terrain variation
    const mapMargin = 15;
    const mapWidth = width - mapMargin * 2;
    const mapY = height - mapHeight - mapMargin;
    const mapX = mapMargin;

    // Calculate scale: map 0 to historicalMaxX (or at least 100m) to mapWidth
    const maxDistance = Math.max(historicalMaxX, 100);
    const scaleX = mapWidth / maxDistance;

    // Terrain height scaling: track height ranges roughly from -3 to +4 meters
    // Map this to the mini-map's vertical space (leaving some padding)
    const terrainPadding = 6;
    const terrainHeight = mapHeight - terrainPadding * 2;
    const minTerrainY = -3;
    const maxTerrainY = 5;
    const scaleY = terrainHeight / (maxTerrainY - minTerrainY);

    // Helper function to convert world Y to mini-map Y
    const worldYToMapY = (worldY) => {
        // Invert because canvas Y is down, world Y is up
        const normalizedY = (worldY - minTerrainY) / (maxTerrainY - minTerrainY);
        return mapY + mapHeight - terrainPadding - (normalizedY * terrainHeight);
    };

    // Draw mini-map background (LCD green with dark border)
    ctx.fillStyle = '#c4f0c2'; // LCD green
    ctx.strokeStyle = '#2f483a'; // Pixel dark
    ctx.lineWidth = 2;
    ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
    ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);

    // Draw terrain line (sample every few meters for efficiency)
    const sampleStep = maxDistance / 50; // ~50 samples across the visible range
    ctx.beginPath();
    ctx.moveTo(mapX, worldYToMapY(getTrackHeight(0)));

    for (let x = sampleStep; x <= maxDistance; x += sampleStep) {
        const terrainY = getTrackHeight(x);
        const screenX = mapX + x * scaleX;
        const screenY = worldYToMapY(terrainY);
        ctx.lineTo(screenX, screenY);
    }

    ctx.strokeStyle = '#2f483a'; // Dark pixel color for terrain
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw historical max distance marker (flag)
    if (historicalMaxX > 0) {
        const flagTerrainY = getTrackHeight(historicalMaxX);
        const flagX = mapX + Math.min(historicalMaxX * scaleX, mapWidth - 5);
        const flagY = worldYToMapY(flagTerrainY) - 12; // Above the terrain

        // Flag pole
        ctx.beginPath();
        ctx.moveTo(flagX, flagY);
        ctx.lineTo(flagX, flagY + 12);
        ctx.strokeStyle = '#2f483a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Flag (triangle)
        ctx.beginPath();
        ctx.moveTo(flagX, flagY);
        ctx.lineTo(flagX + 8, flagY + 4);
        ctx.lineTo(flagX, flagY + 8);
        ctx.closePath();
        ctx.fillStyle = '#e89753'; // Orange button color
        ctx.fill();
        ctx.strokeStyle = '#2f483a';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Draw Next Milestone Marker
    if (nextMilestone) {
        // Only draw if within visible range (or if scale allows it to be seen comfortably)
        // We'll draw it wherever it falls on the map
        const milestoneX = mapX + (nextMilestone * scaleX);

        // Don't draw if it's way off screen
        if (milestoneX < mapX + mapWidth + 20) {
            const mTerrainY = getTrackHeight(nextMilestone);
            const mScreenY = worldYToMapY(mTerrainY);

            // Vertical Line
            ctx.beginPath();
            ctx.moveTo(milestoneX, mapY);
            ctx.lineTo(milestoneX, mapY + mapHeight);
            ctx.strokeStyle = '#ffd700'; // Gold
            ctx.setLineDash([2, 2]);
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);

            // "$" Label
            ctx.fillStyle = '#ffd700';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillText('$', milestoneX - 3, mapY + 8);
        }
    }

    // Draw car dots at correct terrain heights
    cars.forEach(car => {
        if (car.x > 0) {
            const terrainY = getTrackHeight(car.x);
            const dotX = mapX + Math.min(car.x * scaleX, mapWidth - 3);
            const dotY = worldYToMapY(terrainY);
            const dotRadius = car.finished ? 2 : 3;

            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius, 0, 2 * PI);
            ctx.fillStyle = car.finished ? '#5e4b6c' : '#d9455f'; // Finished = muted, Active = red
            ctx.fill();

            // Draw tracked car indicator (Yellow arrow pointing down to the car)
            if (car.id === miniMapData.trackedCarId) {
                ctx.save();
                ctx.translate(dotX, dotY - 8); // Position above the car dot
                ctx.beginPath();
                ctx.moveTo(-4, -6);
                ctx.lineTo(4, -6);
                ctx.lineTo(0, 0); // Point down
                ctx.closePath();
                ctx.fillStyle = '#FFD700'; // Gold/Yellow
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }
    });

    // Draw "RECORD" label
    if (historicalMaxX > 0) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#2f483a';
        ctx.fillText(`${Math.floor(historicalMaxX)}m`, mapX + 5, mapY - 3);
    }
}
