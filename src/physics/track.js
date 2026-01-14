
import * as planck from 'planck-js';

export function getTrackHeight(x) {
    if (x < 0) return 4; // Starting platform wall
    if (x < 10) return 0; // Flat start

    // Increasing difficulty scaling: difficulty increases gradually with distance
    // At x=1000m, difficulty multiplier is ~1.0x
    // At x=2000m, difficulty multiplier is ~1.5x
    // At x=5000m, difficulty multiplier is ~2.5x
    const difficultyScale = Math.max(1.0, (x - 10) / 2000); // Increases at ~0.5 per 1000m

    // Base rolling terrain with bounded height variations
    // Multiple sine waves create natural rolling hills
    const rolling = Math.sin(x * 0.08) * 1.2 + Math.sin(x * 0.25) * 0.6;

    // Divide into 150m sections, each with different character
    const section = Math.floor((x - 10) / 150);
    const sectionLocal = ((x - 10) % 150);

    let terrain = rolling;

    // Alternate between different terrain types for variety
    // Difficulty increases by scaling the slopes and obstacles
    if (section % 4 === 0) {
        // Gentle climb section - gets steeper with distance
        terrain += sectionLocal * 0.004 * difficultyScale;
    } else if (section % 4 === 1) {
        // Valley section - gets deeper with distance
        terrain -= Math.sin(sectionLocal / 150 * Math.PI) * 0.5 * difficultyScale;
    } else if (section % 4 === 2) {
        // Gentle descent - gets steeper with distance
        terrain -= sectionLocal * 0.003 * difficultyScale;
    } else {
        // Wave section - gets more extreme with distance
        terrain += Math.sin(sectionLocal * 0.06) * 0.4 * difficultyScale;
    }

    // Keep terrain reasonably bounded
    // Max height increases with difficulty to allow higher obstacles
    const maxHeight = 4 + Math.min(6, difficultyScale * 2);
    return Math.max(0, Math.min(terrain, maxHeight));
}

export function createTrack(world) {
    const ground = world.createBody({
        type: 'static',
        position: planck.Vec2(0, 0),
    });

    // Sample the track - create very long terrain that extends indefinitely
    const step = 1.0;
    const length = 10000; // Extended far enough for long gameplay sessions
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
