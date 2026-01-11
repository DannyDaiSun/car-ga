
export const PART_DEFINITIONS = {
    block: {
        id: 'block',
        label: 'Block',
        desc: 'Standard chassis block',
        price: 0,
        unlocked: true, // Default
        kind: 'block',
    },
    wheel: {
        id: 'wheel',
        label: 'Wheel',
        desc: 'Standard size wheel',
        price: 0,
        unlocked: true, // Default
        kind: 'wheel',
    },
    big_wheel: {
        id: 'big_wheel',
        label: 'Big Wheel',
        desc: 'Larger radius wheel for rough terrain',
        price: 100,
        unlocked: false,
        kind: 'wheel',
        // Special props handled in DNA generation
        minRadius: 0.8,
        maxRadius: 1.5
    },
    long_body: {
        id: 'long_body',
        label: 'Long Bar',
        desc: 'Long, thin body part for reach',
        price: 150,
        unlocked: false,
        kind: 'block',
        // Special props
        minW: 2.0,
        maxW: 4.0,
        minH: 0.2,
        maxH: 0.4
    },
    jetpack: {
        id: 'jetpack',
        label: 'Jetpack',
        desc: 'Applies constant forward thrust',
        price: 300,
        unlocked: false,
        kind: 'jetpack',
        thrust: 200 // Force amount
    }
};

export const ECONOMY = {
    MONEY_PER_MILESTONE: 20, // Money gained per milestone
    MILESTONE_DISTANCE: 50,   // Meters
};
