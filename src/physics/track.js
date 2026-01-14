
import * as planck from 'planck-js';

export function getTrackHeight(x) {
    if (x < 0) return 4; // Starting platform wall
    if (x < 10) return 0; // Flat start

    // Reasonable, drivable terrain with bounded height variations
    // Multiple sine waves create natural rolling hills without growing in amplitude
    const rolling = Math.sin(x * 0.08) * 1.2 + Math.sin(x * 0.25) * 0.6;

    // Add occasional gentle slopes (divide into 150m sections, each with different character)
    const section = Math.floor((x - 10) / 150);
    const sectionLocal = ((x - 10) % 150);

    let terrain = rolling;

    // Alternate between different terrain types for variety
    if (section % 4 === 0) {
        // Gentle climb section
        terrain += sectionLocal * 0.004; // Shallow ramp ~0.6 degree
    } else if (section % 4 === 1) {
        // Valley section (dips down slightly)
        terrain -= Math.sin(sectionLocal / 150 * Math.PI) * 0.5;
    } else if (section % 4 === 2) {
        // Gentle descent
        terrain -= sectionLocal * 0.003; // Slight downward ramp
    } else {
        // Wave section - just rolling
        terrain += Math.sin(sectionLocal * 0.06) * 0.4;
    }

    // Keep terrain reasonably bounded (car height is ~1.5m, so bumps should be manageable)
    return Math.max(0, Math.min(terrain, 4));
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
