
import { PI } from '../ga/dna.js';
import * as planck from 'planck-js';
import { getTrackHeight } from '../physics/track.js';

const SCALE = 20; // pixels per meter

export function render(ctx, world, cameraX, width, height, championId, miniMapData) {
    // Draw Sky - LCD Green
    ctx.fillStyle = '#c4f0c2';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Camera Transform
    // Centered horizontally on cameraX, vertically centered/offset?
    // Ground is at y=0. Let's put y=0 at 3/4 height.
    ctx.translate(width / 4, height * 0.75); // Moved camera slightly left (width/4) so we see more forward
    ctx.scale(SCALE, -SCALE); // Invert Y for physics coords
    ctx.translate(-cameraX, 0);

    // Check line styles
    ctx.lineWidth = 2 / SCALE; // constant pixel width

    // Iterate bodies
    // We only want to render:
    // 1. Static Ground (always)
    // 2. Champion Car Parts (only if ID matches champion)

    // Iterating all bodies to filter is fast enough?
    // planck world walker:
    for (let b = world.getBodyList(); b; b = b.getNext()) {
        const type = b.getType(); // 'static', 'dynamic', 'kinematic'
        const isStatic = (type === 'static');

        // We need to identify if this body belongs to the champion.
        // We can do this by checking UserData or checking checking if it's in the champion's parts list.
        // We need 'championId' or reference.
        // Let's assume Sim or App passes a way to identify.
        // Quick hack: 'static' is ground. 'dynamic' is cars.
        // If dynamic, we check if it is part of champion.

        // But the 'world' object does not easily map Body -> CarID unless we stored it.
        // We should store carId in userData of bodies during buildCar.

        const userData = b.getUserData();
        // Assume userData = { carId: ... } or null

        let shouldRender = false;
        if (isStatic) {
            shouldRender = true;
        } else {
            // It's a car part.
            // We only render if it matches championId (if provided).
            // If championId is null/undefined, render all? SOP says 'only champion'.
            if (userData && userData.carId === championId) {
                shouldRender = true;
            }
        }

        if (shouldRender) {
            const pos = b.getPosition();
            const angle = b.getAngle();

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(angle);

            if (isStatic) {
                // Ground Rendering - Dark Pixel
                ctx.fillStyle = '#2f483a';
                ctx.strokeStyle = '#2f483a';
            } else {
                // Dynamic/Car - Red/Orange Accent
                ctx.fillStyle = '#d9455f';
                ctx.strokeStyle = '#2f483a'; // Dark outline
            }

            for (let f = b.getFixtureList(); f; f = f.getNext()) {
                const shape = f.getShape();
                const type = shape.getType();

                ctx.beginPath();
                if (type === 'circle') {
                    const r = shape.getRadius();
                    const center = shape.getCenter();
                    ctx.arc(center.x, center.y, r, 0, 2 * PI);
                    // Spoke to see rotation
                    ctx.moveTo(center.x, center.y);
                    ctx.lineTo(center.x + r, center.y);
                } else if (type === 'polygon') {
                    const vertices = shape.m_vertices;
                    if (vertices && vertices.length) {
                        ctx.moveTo(vertices[0].x, vertices[0].y);
                        for (let i = 1; i < vertices.length; i++) {
                            ctx.lineTo(vertices[i].x, vertices[i].y);
                        }
                        ctx.closePath();
                    }
                } else if (type === 'chain') {
                    const vertices = shape.m_vertices;
                    if (vertices && vertices.length) {
                        ctx.moveTo(vertices[0].x, vertices[0].y);
                        for (let i = 1; i < vertices.length; i++) {
                            ctx.lineTo(vertices[i].x, vertices[i].y);
                        }

                        // For ground, we want to close the shape downwards to fill it
                        if (isStatic) {
                            // Extend down from last point to deep Y
                            const last = vertices[vertices.length - 1];
                            const first = vertices[0];
                            const deepY = -100; // Deep enough below view

                            ctx.lineTo(last.x, deepY);
                            ctx.lineTo(first.x, deepY);
                            ctx.lineTo(first.x, first.y);
                        }
                    }
                }

                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    ctx.restore();

    // Draw Mini-Map
    if (miniMapData) {
        renderMiniMap(ctx, miniMapData, width, height);
    }
}

/**
 * Renders a mini-map bar at the bottom of the screen.
 * Shows terrain shape, all cars as dots at correct heights, and a flag at the historical max distance.
 */
function renderMiniMap(ctx, miniMapData, width, height) {
    const { cars, historicalMaxX } = miniMapData;

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
        }
    });

    // Draw "RECORD" label
    if (historicalMaxX > 0) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#2f483a';
        ctx.fillText(`${Math.floor(historicalMaxX)}m`, mapX + 5, mapY - 3);
    }
}
