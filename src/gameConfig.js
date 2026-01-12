
export const PART_DEFINITIONS = {
    block: {
        id: 'block',
        label: 'Block',
        desc: 'Standard chassis block',
        price: 0,
        unlocked: true, // Default
        kind: 'block',
        icon: '🟫',
        tier: 'common',
    },
    wheel: {
        id: 'wheel',
        label: 'Wheel',
        desc: 'Standard size wheel',
        price: 0,
        unlocked: true, // Default
        kind: 'wheel',
        icon: '⚙️',
        tier: 'common',
        motorMultiplier: 1.3
    },
    big_wheel: {
        id: 'big_wheel',
        label: 'Big Wheel',
        desc: 'Larger radius wheel for rough terrain',
        price: 100,
        unlocked: false,
        kind: 'wheel',
        icon: '🛞',
        tier: 'uncommon',
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
        icon: '📏',
        tier: 'rare',
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
        icon: '🚀',
        tier: 'legendary',
        thrust: 200 // Force amount
    },
    small_wheel: {
        id: 'small_wheel',
        label: 'Small Wheel',
        desc: 'Compact wheel - Faster spin, less durable',
        price: 75,
        unlocked: false,
        kind: 'small_wheel',
        icon: '⚙️',
        tier: 'uncommon',
        minRadius: 0.15,
        maxRadius: 0.3,
        motorMultiplier: 1.5,   // 50% faster motor speed
        breakMultiplier: 0.6    // 40% easier to break
    },
    tiny_wheel: {
        id: 'tiny_wheel',
        label: 'Tiny Wheel',
        desc: 'Ultra-compact - Very fast spin, very fragile',
        price: 125,
        unlocked: false,
        kind: 'tiny_wheel',
        icon: '⚙️',
        tier: 'rare',
        minRadius: 0.08,
        maxRadius: 0.15,
        motorMultiplier: 2.0,   // 2x faster motor speed
        breakMultiplier: 0.3    // 70% easier to break
    }
};

export const ECONOMY = {
    STARTING_MONEY: 200,
    MONEY_PER_MILESTONE: 30, // Money gained per milestone
    MILESTONE_DISTANCE: 30,   // Meters (more frequent, more rewarding)
};
