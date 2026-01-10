
import { PI } from '../ga/dna.js';
import * as planck from 'planck-js';

const SCALE = 20; // pixels per meter

export function render(ctx, world, cameraX, width, height, championId) {
    // Draw Sky
    ctx.fillStyle = '#87CEEB'; // Sky Blue
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
                // Ground Rendering
                ctx.fillStyle = '#505050'; // Dark Grey Solid Ground
                ctx.strokeStyle = '#505050'; // Match fill to hide seams
            } else {
                // Dynamic/Car
                ctx.fillStyle = '#e55';
                ctx.strokeStyle = '#333';
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
}
