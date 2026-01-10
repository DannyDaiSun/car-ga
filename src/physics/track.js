
import * as planck from 'planck-js';

export function getTrackHeight(x) {
    if (x < 0) return 4; // Starting platform wall
    if (x < 10) return 0; // Flat start

    // Deterministic bumps
    // A mix of sine waves and noise-like structure
    return Math.sin(x * 0.1) * 2 + Math.sin(x * 0.5) * 1 + Math.sin(x * 1.3) * 0.5 * Math.max(0, (x - 10) / 50);
}

export function createTrack(world) {
    const ground = world.createBody({
        type: 'static',
        position: planck.Vec2(0, 0),
    });

    // Sample the track
    const step = 1.0;
    const length = 2000; // Long enough
    const points = [];

    // Starting Wall
    points.push(planck.Vec2(-10, 10));
    points.push(planck.Vec2(-10, 0));

    for (let x = -5; x < length; x += step) {
        points.push(planck.Vec2(x, getTrackHeight(x)));
    }

    // Create chain shape
    // Planck ChainShape takes array of Vec2
    const shape = planck.Chain(points, false);

    ground.createFixture({
        shape: shape,
        friction: 0.8,
        friction: 0.8
        // filterGroupIndex: -1 // REMOVED: Caused collision failure with cars (which are also -1)
    });

    return ground;
}
